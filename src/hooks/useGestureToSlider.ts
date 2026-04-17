"use client";

import { useCallback, useRef, useState } from "react";
import type { LampSliderHandle } from "@/components/LampSlider";
import { useEmaSmoothing } from "./useEmaSmoothing";
import type { HandFrame } from "./useHandTracking";

/**
 * SWIPE v5 — Flat blackout cooldown.
 *
 * Sau mỗi lần fire, khoá detection trong `cooldownMs` (mặc định 800ms).
 * Trong blackout: buffer không ghi, không xét displacement. User tự do
 * kéo tay về vị trí thoải mái mà không sợ fire ngược. Hết blackout thì
 * mọi thứ lại tinh khôi.
 *
 * Luật duy nhất cho user: "vuốt → chờ thanh nạp xong → vuốt tiếp".
 */

type Config = {
  windowMs?: number;
  swipeThreshold?: number;
  cooldownMs?: number;
  minWindowMs?: number;
  smoothAlpha?: number;
};

export type SwipeFeedback = {
  /** 0..1: displacement hiện tại so với threshold (khi đang armed). */
  progress: number;
  direction: "next" | "prev" | null;
  justFired: "next" | "prev" | null;
  /** True khi đang trong blackout. */
  cooling: boolean;
  /** 0..1: phần blackout đã trôi qua. 1 = ready. */
  cooldownProgress: number;
};

const EMPTY: SwipeFeedback = {
  progress: 0,
  direction: null,
  justFired: null,
  cooling: false,
  cooldownProgress: 1,
};

export function useGestureToSlider(
  sliderRef: React.RefObject<LampSliderHandle | null>,
  {
    windowMs = 320,
    swipeThreshold = 0.16,
    cooldownMs = 1000,
    minWindowMs = 140,
    smoothAlpha = 0.7,
  }: Config = {},
) {
  const smooth = useEmaSmoothing(smoothAlpha);
  const bufRef = useRef<Array<{ x: number; t: number }>>([]);
  const lockedUntilRef = useRef(0);
  const justFiredRef = useRef<{ dir: "next" | "prev"; until: number } | null>(null);

  const [feedback, setFeedback] = useState<SwipeFeedback>(EMPTY);
  const publish = useCallback((f: SwipeFeedback) => {
    setFeedback((prev) =>
      prev.direction === f.direction &&
      prev.justFired === f.justFired &&
      prev.cooling === f.cooling &&
      Math.abs(prev.progress - f.progress) < 0.02 &&
      Math.abs(prev.cooldownProgress - f.cooldownProgress) < 0.02
        ? prev
        : f,
    );
  }, []);

  const onFrame = useCallback(
    (frame: HandFrame | null) => {
      const now = frame?.t ?? performance.now();
      const jf = justFiredRef.current;
      const justFired = jf && now < jf.until ? jf.dir : null;
      const locked = now < lockedUntilRef.current;
      const cooldownProgress = locked
        ? 1 - (lockedUntilRef.current - now) / cooldownMs
        : 1;

      if (!frame) {
        smooth.reset();
        bufRef.current = [];
        publish({
          progress: 0,
          direction: null,
          justFired,
          cooling: locked,
          cooldownProgress,
        });
        return;
      }

      if (locked) {
        // Trong blackout: không ghi buffer, không detect. Reset smoothing
        // để lúc hết blackout đo vx từ trạng thái mới.
        smooth.reset();
        bufRef.current = [];
        publish({
          progress: 0,
          direction: null,
          justFired,
          cooling: true,
          cooldownProgress,
        });
        return;
      }

      const x = smooth.push(frame.x);
      const buf = bufRef.current;
      buf.push({ x, t: now });
      while (buf.length && now - buf[0].t > windowMs) buf.shift();

      if (buf.length < 2) {
        publish({
          progress: 0,
          direction: null,
          justFired,
          cooling: false,
          cooldownProgress: 1,
        });
        return;
      }

      const first = buf[0];
      const last = buf[buf.length - 1];
      const dx = last.x - first.x;
      const dt = last.t - first.t;
      const magnitude = Math.abs(dx);
      const dir: "next" | "prev" | null =
        magnitude > 0.03 ? (dx > 0 ? "next" : "prev") : null;
      const progress = Math.min(magnitude / swipeThreshold, 1);

      if (magnitude >= swipeThreshold && dt >= minWindowMs && dir) {
        if (dir === "next") sliderRef.current?.next();
        else sliderRef.current?.prev();
        lockedUntilRef.current = now + cooldownMs;
        justFiredRef.current = { dir, until: now + 420 };
        bufRef.current = [];
        smooth.reset();
        publish({
          progress: 1,
          direction: dir,
          justFired: dir,
          cooling: true,
          cooldownProgress: 0,
        });
        return;
      }

      publish({
        progress,
        direction: dir,
        justFired,
        cooling: false,
        cooldownProgress: 1,
      });
    },
    [cooldownMs, minWindowMs, publish, sliderRef, smooth, swipeThreshold, windowMs],
  );

  return { onFrame, feedback };
}
