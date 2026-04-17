"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getHandLandmarker } from "@/lib/mediapipe";

export type HandFrame = {
  /** x trong tọa độ user (đã mirror): 0 = bên trái user, 1 = bên phải user. */
  x: number;
  /** y: 0 = trên, 1 = dưới. */
  y: number;
  /** Tỉ lệ khoảng cách thumb-tip ↔ index-tip so với hand scale
   *  (wrist → middle-MCP). < ~0.25 là chụm, > ~0.4 là xoè. Không phụ thuộc
   *  tay gần/xa camera. */
  pinchRatio: number;
  /** timestamp ms để callback tính velocity. */
  t: number;
};

export type HandTrackingStatus =
  | "idle"
  | "requesting"
  | "loading-model"
  | "running"
  | "error"
  | "denied";

type Options = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFrame?: (frame: HandFrame | null) => void;
  enabled: boolean;
};

export function useHandTracking({ videoRef, onFrame, enabled }: Options) {
  const [status, setStatus] = useState<HandTrackingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasHand, setHasHand] = useState(false);

  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasHand(false);
    setStatus("idle");
  }, [videoRef]);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setStatus("requesting");

        if (typeof window !== "undefined" && !window.isSecureContext) {
          throw Object.assign(
            new Error(
              "Trang phải mở qua localhost hoặc HTTPS. URL hiện tại không phải secure context.",
            ),
            { name: "SecurityError" },
          );
        }
        if (!navigator.mediaDevices?.getUserMedia) {
          throw Object.assign(
            new Error("Trình duyệt không hỗ trợ getUserMedia."),
            { name: "NotSupportedError" },
          );
        }

        const stream = await navigator.mediaDevices
          .getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
            },
            audio: false,
          })
          .catch(async (primaryErr) => {
            // fallback: bỏ facingMode để tương thích cam desktop/laptop không có hint
            if (
              primaryErr?.name === "OverconstrainedError" ||
              primaryErr?.name === "NotFoundError"
            ) {
              return await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
            }
            throw primaryErr;
          });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play().catch(() => undefined);

        setStatus("loading-model");
        const landmarker = await getHandLandmarker();
        if (cancelled) return;
        setStatus("running");

        const loop = () => {
          if (cancelled) return;
          const v = videoRef.current;
          if (!v) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          // Khi WebcamPreview remount (VD: đổi layout), video element mới
          // chưa có stream — reattach stream còn sống.
          if (streamRef.current && v.srcObject !== streamRef.current) {
            v.srcObject = streamRef.current;
            v.play().catch(() => undefined);
          }
          if (v.readyState < 2) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }
          if (v.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = v.currentTime;
            const result = landmarker.detectForVideo(v, performance.now());
            const lm = result.landmarks?.[0];
            if (lm && lm.length >= 21) {
              // palm center: trung bình wrist (0) + các MCP (5,9,13,17)
              const pts = [0, 5, 9, 13, 17].map((i) => lm[i]);
              const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
              const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
              // mirror x: video hiển thị đảo ngang nên user vung tay sang phải
              // (từ góc nhìn mình) tương ứng x nhỏ. Đảo lại để vx > 0 = user's right.
              const thumbTip = lm[4];
              const indexTip = lm[8];
              const wrist = lm[0];
              const middleMcp = lm[9];
              const pinchDist = Math.hypot(
                thumbTip.x - indexTip.x,
                thumbTip.y - indexTip.y,
              );
              const handScale = Math.max(
                0.02,
                Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y),
              );
              const frame: HandFrame = {
                x: 1 - avgX,
                y: avgY,
                pinchRatio: pinchDist / handScale,
                t: performance.now(),
              };
              setHasHand(true);
              onFrameRef.current?.(frame);
            } else {
              setHasHand(false);
              onFrameRef.current?.(null);
            }
          }
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        if (cancelled) return;
        const err = e as Error;
        const denied =
          err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError";
        setStatus(denied ? "denied" : "error");
        const name = err?.name || err?.constructor?.name || "Error";
        const msg = err?.message || String(err) || "không có chi tiết";
        setError(`${name} — ${msg}`);
        // console.warn để Next dev overlay không pop up che UI
        // eslint-disable-next-line no-console
        console.warn(
          "[hand-tracking] getUserMedia failed",
          { name, message: msg, toString: String(err) },
        );
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, stop, videoRef]);

  return { status, error, hasHand, stop };
}
