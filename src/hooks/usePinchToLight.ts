"use client";

import { useCallback, useRef, useState } from "react";
import type { HandFrame } from "./useHandTracking";

/**
 * Pinch-to-light: chụm ngón cái + ngón trỏ = đèn sáng, tách ra = tắt.
 *
 * Clutch semantics (giữ để sáng). Hysteresis 2 ngưỡng chống flicker:
 * - enterRatio: ratio < value → enter pinch
 * - exitRatio: ratio > value → exit pinch
 *
 * Suppress `suppressAfterFireMs` ngay sau khi swipe fire, để pha "rút tay
 * về" không gây pinch giả.
 *
 * Khi không thấy tay: tự động off (safety default).
 */

type Config = {
  enterRatio?: number;
  exitRatio?: number;
  suppressAfterFireMs?: number;
};

export type PinchFeedback = {
  isPinching: boolean;
  /** 0..1: ước lượng "độ chụm". 1 = cọ vào nhau, 0 = xoè. */
  intensity: number;
};

const EMPTY: PinchFeedback = { isPinching: false, intensity: 0 };

export function usePinchToLight({
  enterRatio = 0.32,
  exitRatio = 0.45,
  suppressAfterFireMs = 300,
}: Config = {}) {
  const pinchedRef = useRef(false);
  const suppressUntilRef = useRef(0);
  const [feedback, setFeedback] = useState<PinchFeedback>(EMPTY);

  const publish = useCallback((f: PinchFeedback) => {
    setFeedback((prev) =>
      prev.isPinching === f.isPinching &&
      Math.abs(prev.intensity - f.intensity) < 0.02
        ? prev
        : f,
    );
  }, []);

  /** Gọi khi swipe vừa fire để suppress pinch 300ms tiếp theo. */
  const notifyFire = useCallback((t: number) => {
    suppressUntilRef.current = t + suppressAfterFireMs;
  }, [suppressAfterFireMs]);

  const onFrame = useCallback(
    (frame: HandFrame | null) => {
      if (!frame) {
        if (pinchedRef.current) pinchedRef.current = false;
        publish(EMPTY);
        return;
      }

      if (frame.t < suppressUntilRef.current) {
        if (pinchedRef.current) pinchedRef.current = false;
        publish({ isPinching: false, intensity: 0 });
        return;
      }

      const ratio = frame.pinchRatio;
      const was = pinchedRef.current;
      const now = was ? ratio < exitRatio : ratio < enterRatio;
      pinchedRef.current = now;

      // intensity: 0 khi ratio >= exitRatio, 1 khi ratio <= 0
      const intensity = Math.max(
        0,
        Math.min(1, (exitRatio - ratio) / exitRatio),
      );

      publish({ isPinching: now, intensity });
    },
    [enterRatio, exitRatio, publish],
  );

  return { onFrame, feedback, notifyFire };
}
