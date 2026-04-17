"use client";

import type { Lamp } from "@/lib/lamps";

type Props = {
  lamp: Lamp;
  isActive: boolean;
};

const vnd = new Intl.NumberFormat("vi-VN");

export function LampCard({ lamp, isActive }: Props) {
  return (
    <article
      className={[
        "relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-eoi-border bg-white shadow-sm transition-all duration-500",
        isActive
          ? "scale-100 opacity-100 shadow-xl shadow-black/10"
          : "scale-[0.92] opacity-70",
      ].join(" ")}
      style={{
        backgroundImage: `radial-gradient(120% 70% at 50% 0%, ${lamp.color}, white 65%)`,
      }}
    >
      <div className="relative flex flex-1 items-center justify-center p-8">
        <LampGlyph color={lamp.accent} tint={lamp.color} />
      </div>

      <div className="flex flex-col gap-2 border-t border-eoi-border/70 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-eoi-ink">
            {lamp.name}
          </h3>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: `${lamp.accent}14`,
              color: lamp.accent,
            }}
          >
            {vnd.format(lamp.price)}₫
          </span>
        </div>
        <p className="text-sm font-medium text-eoi-ink2">{lamp.tagline}</p>
        <p className="text-[13px] leading-relaxed text-eoi-ink2/80">
          {lamp.description}
        </p>
      </div>
    </article>
  );
}

function LampGlyph({ color, tint }: { color: string; tint: string }) {
  return (
    <svg
      viewBox="0 0 200 260"
      className="h-full w-auto max-h-[340px] drop-shadow-[0_24px_40px_rgba(0,0,0,0.12)]"
      aria-hidden
    >
      <defs>
        <radialGradient id={`glow-${color}`} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor={tint} stopOpacity="1" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`shade-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="95" r="85" fill={`url(#glow-${color})`} />
      <path
        d="M55 100 Q100 20 145 100 L130 165 Q100 180 70 165 Z"
        fill={`url(#shade-${color})`}
        stroke={color}
        strokeOpacity="0.4"
        strokeWidth="1.5"
      />
      <rect x="92" y="163" width="16" height="55" rx="4" fill={color} opacity="0.85" />
      <ellipse cx="100" cy="225" rx="42" ry="8" fill={color} opacity="0.7" />
    </svg>
  );
}
