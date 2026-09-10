import type { CSSProperties } from "react";
import type { StrengthGain } from "../lib/strengthGains";

interface StrengthGainListProps {
  gains: StrengthGain[];
  /** Fx "max-h-64 overflow-y-auto" for en selvstændigt scrollbar liste. */
  className?: string;
}

/** Barerne cykler gennem kategorifarverne, så en lang liste er nemmere at skimme end én farve i alle rækker. */
const BAR_COLORS = [
  "var(--color-cat-cardio)",
  "var(--color-cat-progress)",
  "var(--color-cat-strength)",
  "var(--color-cat-record)",
  "var(--color-cat-goal)",
];

export function StrengthGainList({ gains, className = "" }: StrengthGainListProps) {
  const maxPercent = Math.max(1, ...gains.map((g) => Math.abs(g.percent)));
  return (
    <div className={`flex flex-col gap-2.5 overscroll-contain ${className}`}>
      {gains.map((gain, index) => (
        <div key={gain.name} className="flex flex-shrink-0 flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="truncate text-(--color-text)">{gain.name}</span>
            <span className="flex-shrink-0 font-medium text-(--color-text-muted)">
              {gain.percent > 0 ? "+" : ""}
              {gain.percent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
            <div
              className="cat-bar h-full rounded-full"
              style={
                {
                  width: `${Math.max(4, (Math.abs(gain.percent) / maxPercent) * 100)}%`,
                  "--badge-color": BAR_COLORS[index % BAR_COLORS.length],
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
