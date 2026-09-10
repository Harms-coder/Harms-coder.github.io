import type { CSSProperties } from "react";
import type { CategoryLoad } from "../lib/muscleBalance";

/** Samme farvecyklus som StrengthGainList, så en liste med mange rækker er til at skimme. */
const BAR_COLORS = [
  "var(--color-cat-strength)",
  "var(--color-cat-cardio)",
  "var(--color-cat-progress)",
  "var(--color-cat-record)",
  "var(--color-cat-goal)",
  "var(--color-cat-body)",
];

export function MuscleBalance({ loads }: { loads: CategoryLoad[] }) {
  const max = Math.max(1, ...loads.map((l) => l.sets));

  return (
    <div className="flex flex-col gap-2.5">
      {loads.map((load, index) => (
        <div key={load.category} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-[13px]">
            <span className="truncate text-(--color-text)">{load.category}</span>
            <span className="flex-shrink-0 font-medium text-(--color-text-muted)">
              {load.sets} sæt · {load.percent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
            <div
              className="cat-bar h-full rounded-full"
              style={
                {
                  width: `${Math.max(4, (load.sets / max) * 100)}%`,
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
