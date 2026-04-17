"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LAMPS } from "@/lib/lamps";
import { LampCard } from "./LampCard";

export type LampSliderHandle = {
  next: () => void;
  prev: () => void;
  scrollTo: (index: number) => void;
  getSelected: () => number;
};

type Props = {
  onSelect?: (index: number) => void;
  litLampId?: string | null;
};

export const LampSlider = forwardRef<LampSliderHandle, Props>(function LampSlider(
  { onSelect, litLampId },
  ref,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    dragFree: false,
    containScroll: false,
  });
  const [selected, setSelected] = useState(0);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!emblaApi) return;
    const handler = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelected(idx);
      onSelectRef.current?.(idx);
    };
    handler();
    emblaApi.on("select", handler);
    emblaApi.on("reInit", handler);
    return () => {
      emblaApi.off("select", handler);
      emblaApi.off("reInit", handler);
    };
  }, [emblaApi]);

  useImperativeHandle(
    ref,
    () => ({
      next: () => emblaApi?.scrollNext(),
      prev: () => emblaApi?.scrollPrev(),
      scrollTo: (idx: number) => emblaApi?.scrollTo(idx),
      getSelected: () => emblaApi?.selectedScrollSnap() ?? 0,
    }),
    [emblaApi],
  );

  const onPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const onNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);

  return (
    <div className="relative w-full">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container py-8">
          {LAMPS.map((lamp, i) => (
            <div
              key={lamp.id}
              className="embla__slide px-3 sm:px-5"
              style={{ flexBasis: "clamp(240px, 70vw, 380px)" }}
            >
              <div className="aspect-[4/5]">
                <LampCard
                  lamp={lamp}
                  isActive={i === selected}
                  isLit={litLampId === lamp.id}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onPrev}
        aria-label="Đèn trước"
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-eoi-border bg-white/90 p-3 text-eoi-ink shadow-sm backdrop-blur transition hover:bg-white sm:left-6"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Đèn tiếp theo"
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-eoi-border bg-white/90 p-3 text-eoi-ink shadow-sm backdrop-blur transition hover:bg-white sm:right-6"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-2 flex items-center justify-center gap-2">
        {LAMPS.map((lamp, i) => (
          <button
            key={lamp.id}
            type="button"
            aria-label={`Tới đèn ${lamp.name}`}
            onClick={() => emblaApi?.scrollTo(i)}
            className={[
              "h-2 rounded-full transition-all",
              i === selected
                ? "w-6 bg-eoi-ink"
                : "w-2 bg-eoi-ink/25 hover:bg-eoi-ink/50",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
});
