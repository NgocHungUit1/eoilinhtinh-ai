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
    const id = window.setTimeout(() => setVisible(false), 3500);
    return () => window.clearTimeout(id);
  }, [show]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-4 animate-fade-in">
      <div className="flex items-center gap-3 rounded-full border border-eoi-border bg-white/90 px-5 py-3 text-sm font-medium text-eoi-ink shadow-lg backdrop-blur">
        <Hand className="h-5 w-5 animate-wave text-eoi-pink-dark" />
        Vuốt tay sang trái / phải để lướt đèn
      </div>
    </div>
  );
}
