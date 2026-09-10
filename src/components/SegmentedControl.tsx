import type { CSSProperties } from "react";
import { TONE_COLORS, type Tone } from "./Button";

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "wrap" (fælles bredde, fx range-faner) eller "scroll" (venstrestillet, horisontalt scrollbar, fx filtre). */
  layout?: "wrap" | "scroll";
  /** Kategorifarve på det aktive valg, så filtre matcher sidens farve. Default: accent/orange. */
  tone?: Tone;
  /** "sm" er en anelse lavere — til kontroller der ikke skal dominere toppen af en side. */
  size?: "md" | "sm";
}

/** Genanvendelig "glow"-pille-kontrol til faner/filtre — aktivt valg får gradient + glow i sidens tone, resten er dæmpede. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layout = "wrap",
  tone = "accent",
  size = "md",
}: SegmentedControlProps<T>) {
  const height = size === "sm" ? "min-h-8" : "min-h-9";
  const containerClass =
    layout === "wrap"
      ? `glass-fill flex gap-1 rounded-full ${size === "sm" ? "p-0.5" : "p-1"}`
      : "no-scrollbar flex gap-2 overflow-x-auto";
  const buttonClass =
    layout === "wrap"
      ? `${height} flex-1 whitespace-nowrap rounded-full px-1 text-[12px] font-medium`
      : `${height} flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium`;
  const inactiveClass = layout === "wrap" ? "bg-transparent" : "glass-fill";

  return (
    <div className={containerClass} style={{ "--badge-color": TONE_COLORS[tone] } as CSSProperties}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`${buttonClass} ${
            value === option.value
              ? "cat-fill border-transparent text-(--color-text)"
              : `${inactiveClass} text-(--color-text-muted)`
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
