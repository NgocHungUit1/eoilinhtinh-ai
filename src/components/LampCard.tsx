"use client";

import type { Lamp } from "@/lib/lamps";

type Props = {
  lamp: Lamp;
  isActive: boolean;
  isLit?: boolean;
};

const vnd = new Intl.NumberFormat("vi-VN");

export function LampCard({ lamp, isActive, isLit = false }: Props) {
  return (
    <article
      className={[
        "relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border bg-white transition-all duration-500",
        isActive
          ? "scale-100 opacity-100"
          : "scale-[0.92] opacity-70",
        isLit
          ? "border-white/80 shadow-[0_18px_50px_-10px] scale-[1.02]"
          : "border-eoi-border shadow-sm",
      ].join(" ")}
      style={{
        backgroundImage: `radial-gradient(120% 70% at 50% 0%, ${lamp.color}, white 65%)`,
        ...(isLit
          ? ({
              boxShadow: `0 24px 60px -12px ${lamp.accent}66, 0 0 0 6px ${lamp.accent}22`,
            } as React.CSSProperties)
          : {}),
      }}
    >
      <div className="relative flex flex-1 items-center justify-center p-8">
        <LampGlyph color={lamp.accent} tint={lamp.color} isLit={isLit} />
      </div>

      <div className="flex flex-col gap-2 border-t border-eoi-border/70 bg-white/80 p-5 backdrop-blur">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-eoi-ink">
            {lamp.name}
          </h3>
          <span
            className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              backgroundColor: isLit ? lamp.accent : `${lamp.accent}14`,
              color: isLit ? "#fff" : lamp.accent,
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

function LampGlyph({
  color,
  tint,
  isLit,
}: {
  color: string;
  tint: string;
  isLit: boolean;
}) {
  const haloId = `glow-${color}-${isLit ? "on" : "off"}`;
  const shadeId = `shade-${color}-${isLit ? "on" : "off"}`;
  return (
    <svg
      viewBox="0 0 200 260"
      className={[
        "h-full w-auto max-h-[340px] transition-[filter,transform] duration-300",
        isLit
          ? "drop-shadow-[0_24px_40px_rgba(0,0,0,0.2)]"
          : "drop-shadow-[0_24px_40px_rgba(0,0,0,0.12)]",
      ].join(" ")}
      aria-hidden
    >
      <defs>
        <radialGradient id={haloId} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor={tint} stopOpacity={isLit ? "1" : "1"} />
          <stop
            offset="100%"
            stopColor={tint}
            stopOpacity={isLit ? "0" : "0"}
          />
        </radialGradient>
        <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={color}
            stopOpacity={isLit ? "1" : "0.95"}
          />
          <stop
            offset="100%"
            stopColor={color}
            stopOpacity={isLit ? "0.85" : "0.55"}
          />
        </linearGradient>
      </defs>

      {/* halo to rộng khi sáng */}
      <circle
        cx="100"
        cy="95"
        r={isLit ? 115 : 85}
        fill={`url(#${haloId})`}
        opacity={isLit ? 0.95 : 0.7}
        style={{ transition: "r 300ms, opacity 300ms" }}
      />

      {/* tia sáng phụ khi bật */}
      {isLit && (
        <g opacity="0.55">
          {[-55, -30, 0, 30, 55].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="95"
              x2={100 + Math.sin((deg * Math.PI) / 180) * 120}
              y2={95 - Math.cos((deg * Math.PI) / 180) * 120}
              stroke={tint}
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      <path
        d="M55 100 Q100 20 145 100 L130 165 Q100 180 70 165 Z"
        fill={`url(#${shadeId})`}
        stroke={color}
        strokeOpacity={isLit ? "0.7" : "0.4"}
        strokeWidth="1.5"
      />
      <rect
        x="92"
        y="163"
        width="16"
        height="55"
        rx="4"
        fill={color}
        opacity="0.85"
      />
      <ellipse cx="100" cy="225" rx="42" ry="8" fill={color} opacity="0.7" />
    </svg>
  );
}
