import type { StrengthGain } from "../lib/strengthGains";

interface StrengthGainListProps {
  gains: StrengthGain[];
  /** Fx "max-h-64 overflow-y-auto" for en selvstændigt scrollbar liste. */
  className?: string;
}

export function StrengthGainList({ gains, className = "" }: StrengthGainListProps) {
  const maxPercent = Math.max(1, ...gains.map((g) => Math.abs(g.percent)));
  return (
    <div className={`flex flex-col gap-2.5 overscroll-contain ${className}`}>
      {gains.map((gain) => (
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
              className="accent-fill h-full rounded-full"
              style={{ width: `${Math.max(4, (Math.abs(gain.percent) / maxPercent) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
