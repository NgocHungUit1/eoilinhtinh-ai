import { useRef } from "react";

/**
 * Exponential moving average smoother dùng cho tọa độ tay (0..1).
 * alpha cao → phản xạ nhanh hơn nhưng nhiễu hơn.
 */
export function useEmaSmoothing(alpha = 0.35) {
  const prev = useRef<number | null>(null);
  const push = (value: number) => {
    if (prev.current === null) {
      prev.current = value;
    } else {
      prev.current = alpha * value + (1 - alpha) * prev.current;
    }
    return prev.current;
  };
  const reset = () => {
    prev.current = null;
  };
  return { push, reset };
}
