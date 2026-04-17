"use client";

import { forwardRef } from "react";
import { ArrowLeft, ArrowRight, Camera, Lightbulb, Loader2, PowerOff } from "lucide-react";
import type { HandTrackingStatus } from "@/hooks/useHandTracking";
import type { SwipeFeedback } from "@/hooks/useGestureToSlider";
import type { PinchFeedback } from "@/hooks/usePinchToLight";

type Props = {
  status: HandTrackingStatus;
  hasHand: boolean;
  feedback: SwipeFeedback;
  pinch: PinchFeedback;
  onStop: () => void;
};

/**
 * Webcam preview ~420px. Khi `cooling=true` show countdown ring ở giữa
 * khung để user biết hệ thống đang "nạp lại" — không phải bị treo.
 */
export const WebcamPreview = forwardRef<HTMLVideoElement, Props>(
  function WebcamPreview({ status, hasHand, feedback, pinch, onStop }, videoRef) {
    const { progress, direction, justFired, cooling, cooldownProgress } = feedback;
    const barPct = Math.round((cooling ? cooldownProgress : progress) * 100);

    const statusLabel =
      status !== "running"
        ? "Chờ camera..."
        : !hasHand
        ? "Đưa tay vào khung hình"
        : cooling
        ? "Đang nạp lại..."
        : "Vuốt tay trái / phải";

    return (
      <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-3xl border border-eoi-border bg-black/85 shadow-xl shadow-black/10">
        <div className="relative aspect-video w-full">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
            playsInline
            muted
          />

          {status !== "running" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 p-6 text-center text-sm text-white">
              {status === "loading-model" || status === "requesting" ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <Camera className="h-7 w-7" />
              )}
              <span className="font-medium">
                {status === "requesting" && "Đang xin quyền camera..."}
                {status === "loading-model" && "Đang tải mô hình bàn tay..."}
                {status === "error" && "Không thể mở camera."}
                {status === "denied" && "Camera bị từ chối."}
                {status === "idle" && "Chưa bật camera."}
              </span>
            </div>
          )}

          {/* Flash trực tiếp khi vừa fire */}
          {status === "running" && justFired && (
            <div
              className={[
                "pointer-events-none absolute inset-0 flex items-center",
                justFired === "next" ? "justify-end pr-6" : "justify-start pl-6",
              ].join(" ")}
            >
              <div className="animate-fade-in rounded-2xl bg-emerald-400/95 p-4 text-white shadow-[0_0_30px_rgba(52,211,153,0.7)]">
                {justFired === "next" ? (
                  <ArrowRight className="h-8 w-8" />
                ) : (
                  <ArrowLeft className="h-8 w-8" />
                )}
              </div>
            </div>
          )}

          {/* Countdown ring giữa khung trong blackout */}
          {status === "running" && cooling && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <CountdownRing progress={cooldownProgress} />
            </div>
          )}

          {/* Directional hint khi đang tích lũy swipe (chưa fire, chưa cooling) */}
          {status === "running" &&
            !cooling &&
            direction &&
            !justFired &&
            progress > 0.15 && (
              <div
                className={[
                  "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-eoi-ink",
                  direction === "next" ? "right-4" : "left-4",
                ].join(" ")}
                style={{ opacity: Math.max(0.35, progress) }}
              >
                {direction === "next" ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <ArrowLeft className="h-5 w-5" />
                )}
              </div>
            )}

          {status === "running" && (
            <button
              type="button"
              onClick={onStop}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              <PowerOff className="h-3.5 w-3.5" />
              Tắt cam
            </button>
          )}

          {/* Pinch indicator — hiện khi đang chụm ngón */}
          {status === "running" && pinch.isPinching && (
            <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-semibold text-amber-950 shadow-[0_0_16px_rgba(251,191,36,0.7)] animate-fade-in">
              <Lightbulb className="h-3.5 w-3.5" fill="currentColor" fillOpacity={0.3} />
              Đang bật
            </div>
          )}
        </div>

        <div className="space-y-2 px-4 py-3 text-[12px] text-white/80">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className={[
                  "h-2 w-2 rounded-full transition",
                  status === "running" && hasHand && !cooling
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : status === "running" && cooling
                    ? "bg-sky-400"
                    : status === "running"
                    ? "bg-amber-400"
                    : "bg-white/40",
                ].join(" ")}
              />
              <span className="font-medium">{statusLabel}</span>
            </span>
            <span className="tabular-nums text-white/50">{barPct}%</span>
          </div>
          {status === "running" && (
            <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
              {cooling ? (
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-sky-400 transition-[width] duration-100"
                  style={{ width: `${cooldownProgress * 100}%` }}
                />
              ) : (
                <>
                  <div
                    className={[
                      "absolute inset-y-0 rounded-full transition-[width,left] duration-100",
                      direction === "next" ? "left-1/2 bg-eoi-pink" : "",
                      direction === "prev" ? "right-1/2 bg-eoi-blue" : "",
                      !direction ? "bg-white/30 left-1/2" : "",
                    ].join(" ")}
                    style={
                      direction === "next"
                        ? { width: `${progress * 50}%` }
                        : direction === "prev"
                        ? { width: `${progress * 50}%` }
                        : { width: "0%" }
                    }
                  />
                  <span className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

function CountdownRing({ progress }: { progress: number }) {
  const size = 72;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 80ms linear" }}
      />
    </svg>
  );
}
