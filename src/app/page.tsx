"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { LampSlider, type LampSliderHandle } from "@/components/LampSlider";
import { PermissionGate } from "@/components/PermissionGate";
import { WebcamPreview } from "@/components/WebcamPreview";
import { GestureHint } from "@/components/GestureHint";
import { LightStatusPill } from "@/components/LightStatusPill";
import { useHandTracking, type HandFrame } from "@/hooks/useHandTracking";
import { useGestureToSlider } from "@/hooks/useGestureToSlider";
import { usePinchToLight } from "@/hooks/usePinchToLight";
import { LAMPS } from "@/lib/lamps";

export default function HomePage() {
  const sliderRef = useRef<LampSliderHandle>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [recentlyOffLampId, setRecentlyOffLampId] = useState<string | null>(null);

  const { onFrame: onGestureFrame, feedback } = useGestureToSlider(sliderRef);
  const {
    onFrame: onPinchFrame,
    feedback: pinchFeedback,
    notifyFire,
  } = usePinchToLight();

  const handleFrame = useCallback(
    (frame: HandFrame | null) => {
      onGestureFrame(frame);
      onPinchFrame(frame);
    },
    [onGestureFrame, onPinchFrame],
  );

  const { status, error, hasHand, stop } = useHandTracking({
    videoRef,
    enabled: cameraEnabled,
    onFrame: handleFrame,
  });

  // Swipe vừa fire → suppress pinch 300ms để pha rút tay không kích nhầm.
  useEffect(() => {
    if (feedback.cooling) {
      notifyFire(performance.now());
    }
  }, [feedback.cooling, notifyFire]);

  useEffect(() => {
    if (status === "denied" || status === "error") {
      setCameraEnabled(false);
    }
  }, [status]);

  const lamp = LAMPS[selectedIdx];
  const litLamp = pinchFeedback.isPinching ? lamp : null;
  const litLampId = litLamp?.id ?? null;

  // Ghi nhớ lamp vừa tắt để hiển thị "vừa tắt" ~1.5s.
  useEffect(() => {
    if (litLampId) {
      setRecentlyOffLampId(null);
      return;
    }
    // isPinching vừa false → nếu trước đó có lamp sáng thì show "vừa tắt"
  }, [litLampId]);

  // Listen transition from on → off
  const prevLitRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevLitRef.current;
    if (prev && !litLampId) {
      setRecentlyOffLampId(prev);
      const id = window.setTimeout(() => setRecentlyOffLampId(null), 1500);
      prevLitRef.current = null;
      return () => window.clearTimeout(id);
    }
    prevLitRef.current = litLampId;
  }, [litLampId]);

  const recentlyOffLamp =
    recentlyOffLampId != null
      ? LAMPS.find((l) => l.id === recentlyOffLampId) ?? null
      : null;

  const busyStatuses: ReadonlySet<typeof status> = new Set([
    "running",
    "loading-model",
    "requesting",
  ] as const);
  const showExperience = cameraEnabled || busyStatuses.has(status);

  return (
    <main className="relative min-h-screen overflow-x-hidden pb-16">
      <div
        className={[
          "eoi-stage-gradient pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500",
          litLamp ? "opacity-100 saturate-150" : "opacity-100",
        ].join(" ")}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-eoi-ink text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-eoi-ink">eoi linh tinh</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-eoi-ink2">
              đèn in 3D · điều khiển bằng cử chỉ
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {!showExperience ? (
          <div className="mx-auto mb-12 flex max-w-3xl flex-col items-center gap-6 text-center">
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-eoi-ink sm:text-5xl">
              Vuốt tay sang bên nào, slider lướt bên đó.
            </h1>
            <p className="max-w-xl text-base text-eoi-ink2">
              Đưa bàn tay vào khung camera rồi vuốt nhanh sang trái hoặc phải —
              như lướt điện thoại, nhưng không chạm gì. Chụm ngón cái + ngón trỏ
              để thắp sáng đèn đang chọn.
            </p>
            <PermissionGate
              onEnable={() => setCameraEnabled(true)}
              loading={status === "requesting" || status === "loading-model"}
              denied={status === "denied"}
              errorMessage={error}
            />
          </div>
        ) : (
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-eoi-ink sm:text-4xl">
              {lamp.name}
            </h1>
            <p className="max-w-lg text-sm text-eoi-ink2">{lamp.tagline}</p>
          </div>
        )}

        <div className="relative">
          <LampSlider
            ref={sliderRef}
            onSelect={setSelectedIdx}
            litLampId={litLampId}
          />
        </div>

        {!showExperience && (
          <p className="mt-10 text-center text-xs text-eoi-ink2">
            Chưa muốn bật camera? Dùng phím ← → hoặc kéo thẳng trên slider.
          </p>
        )}
      </section>

      {showExperience && (
        <LightStatusPill litLamp={litLamp} recentlyOffLamp={recentlyOffLamp} />
      )}

      {showExperience && (
        <div className="pointer-events-auto fixed right-4 top-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] sm:w-[360px]">
          <WebcamPreview
            ref={videoRef}
            status={status}
            hasHand={hasHand}
            feedback={feedback}
            pinch={pinchFeedback}
            onStop={() => {
              stop();
              setCameraEnabled(false);
            }}
          />
        </div>
      )}

      <GestureHint show={status === "running"} />
    </main>
  );
}
