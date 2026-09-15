import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { TONE_COLORS, type Tone } from "./Button";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  /** Intet valg = ingen pille (fx reps-forslag, når feltet står på et tal uden for listen). */
  value?: T;
  onChange: (value: T) => void;
  /** "wrap" (fælles bredde, fx range-faner) eller "scroll" (venstrestillet, horisontalt scrollbar, fx filtre). */
  layout?: "wrap" | "scroll";
  /** Kategorifarve på det aktive valg, så filtre matcher sidens farve. Default: accent/guld. */
  tone?: Tone;
  /** "sm" er en anelse lavere — til kontroller der ikke skal dominere toppen af en side. */
  size?: "md" | "sm";
}

/**
 * Pille-kontrol til faner/filtre. Den aktive pille er ét element, der GLIDER hen til det valgte
 * punkt (som pillen i bundmenuen) i stedet for at hoppe. Position og bredde måles på knappen,
 * så det virker både i den faste række og i den rullende.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layout = "wrap",
  tone = "accent",
  size = "md",
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>('[data-active="true"]');
      setPill(
        active
          ? {
              left: active.offsetLeft,
              top: active.offsetTop,
              width: active.offsetWidth,
              height: active.offsetHeight,
            }
          : null,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [value, options.length]);

  const height = size === "sm" ? "min-h-8" : "min-h-9";
  const containerClass =
    layout === "wrap"
      ? `glass-fill relative flex gap-1 rounded-2xl ${size === "sm" ? "p-0.5" : "p-1"}`
      : "no-scrollbar glow-scroller glow-scroller-x relative flex gap-2 overflow-x-auto";
  const buttonClass =
    layout === "wrap"
      ? `${height} flex-1 whitespace-nowrap rounded-xl px-1 text-[12px] font-medium`
      : `${height} flex-shrink-0 rounded-xl px-3.5 text-[13px] font-medium`;
  const inactiveClass = layout === "wrap" ? "bg-transparent" : "glass-fill";

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ "--badge-color": TONE_COLORS[tone] } as CSSProperties}
    >
      {pill && (
        <span
          aria-hidden="true"
          className="cat-fill absolute left-0 top-0 rounded-xl transition-[transform,width] duration-300 ease-[cubic-bezier(0.2,0.9,0.25,1.05)]"
          style={{
            width: pill.width,
            height: pill.height,
            transform: `translate(${pill.left}px, ${pill.top}px)`,
          }}
        />
      )}
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            data-active={isActive}
            onClick={() => onChange(option.value)}
            className={`${buttonClass} relative z-10 transition-colors ${
              isActive
                ? "bg-transparent text-(--color-text-on-accent)"
                : `${inactiveClass} text-(--color-text-muted)`
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
