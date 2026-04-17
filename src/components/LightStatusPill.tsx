"use client";

import { Lightbulb, LightbulbOff } from "lucide-react";
import type { Lamp } from "@/lib/lamps";

type Props = {
  /** Lamp đang sáng (nếu có). */
  litLamp: Lamp | null;
  /** Lamp vừa tắt trong ~1.5s gần đây (hiển thị để user biết feedback). */
  recentlyOffLamp: Lamp | null;
};

/**
 * Pill nổi giữa-trên slider. 3 trạng thái:
 * - litLamp có → "X đang sáng" (màu accent lamp).
 * - recentlyOffLamp có → "X — vừa tắt" (fade sau 1.5s bên trong cha).
 * - cả 2 null → ẩn hoàn toàn.
 */
export function LightStatusPill({ litLamp, recentlyOffLamp }: Props) {
  const lamp = litLamp ?? recentlyOffLamp;
  const on = Boolean(litLamp);

  if (!lamp) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-30 flex justify-center px-4 sm:top-24">
      <div
        key={`${lamp.id}-${on}`}
        className="animate-fade-in flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-5 py-2.5 text-sm font-semibold shadow-xl backdrop-blur"
        style={{
          color: on ? lamp.accent : "#444",
          borderColor: on ? `${lamp.accent}66` : "rgba(0,0,0,0.08)",
          boxShadow: on
            ? `0 10px 35px -8px ${lamp.accent}66, 0 0 0 4px ${lamp.accent}1a`
            : "0 10px 25px -8px rgba(0,0,0,0.15)",
        }}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: on ? `${lamp.accent}22` : "rgba(0,0,0,0.06)",
          }}
        >
          {on ? (
            <Lightbulb
              className="h-4 w-4"
              style={{ color: lamp.accent }}
              fill={lamp.accent}
              fillOpacity={0.25}
            />
          ) : (
            <LightbulbOff className="h-4 w-4 text-eoi-ink2" />
          )}
        </span>
        <span className="leading-tight">
          {lamp.name}
          <span className="ml-2 text-xs font-normal text-eoi-ink2">
            {on ? "đang sáng" : "vừa tắt"}
          </span>
        </span>
      </div>
    </div>
  );
}
