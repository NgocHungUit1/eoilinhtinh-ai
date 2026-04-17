"use client";

import { useEffect, useState } from "react";
import { Hand } from "lucide-react";

type Props = {
  show: boolean;
};

export function GestureHint({ show }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 5500);
    return () => window.clearTimeout(id);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-4 animate-fade-in">
      <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-eoi-border bg-white/90 px-5 py-3 text-sm text-eoi-ink shadow-lg backdrop-blur sm:flex-row sm:gap-5">
        <span className="flex items-center gap-2 font-medium">
          <Hand className="h-4 w-4 animate-wave text-eoi-pink-dark" />
          Vuốt trái / phải để lướt đèn
        </span>
        <span className="h-4 w-px bg-eoi-border hidden sm:block" />
        <span className="flex items-center gap-2 font-medium">
          <span className="text-base leading-none">🤏</span>
          Chụm ngón cái + trỏ để bật đèn
        </span>
      </div>
    </div>
  );
}
