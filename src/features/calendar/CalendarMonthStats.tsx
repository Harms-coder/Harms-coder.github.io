import type { CSSProperties } from "react";
import { IconDumbbell, IconRun, IconTrophy, type IconComponent } from "../../components/icons";
import type { MonthStats } from "../../lib/calendarStats";

function Tile({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: IconComponent;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-[6.5rem] flex-1 items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-2.5 py-2 card-shadow">
      <span
        className="cat-badge flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border"
        style={{ "--badge-color": color } as CSSProperties}
      >
        <Icon className="h-[15px] w-[15px]" style={{ color }} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] font-bold leading-tight text-(--color-text)">{value}</span>
        <span className="text-[10.5px] leading-tight text-(--color-text-muted)">{label}</span>
      </span>
    </div>
  );
}

/** Ring der viser hvor stor en del af månedens planlagte træninger der blev gennemført. */
function CompletionTile({ percent }: { percent: number }) {
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, percent) / 100) * circumference;

  return (
    <div className="flex min-w-[6.5rem] flex-1 items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-2.5 py-2 card-shadow">
      <svg viewBox="0 0 32 32" className="h-7 w-7 flex-shrink-0 -rotate-90">
        <circle cx="16" cy="16" r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth="4" />
        <circle
          cx="16"
          cy="16"
          r={radius}
          fill="none"
          stroke="var(--color-cat-progress)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] font-bold leading-tight text-(--color-text)">{percent}%</span>
        <span className="text-[10.5px] leading-tight text-(--color-text-muted)">gennemført</span>
      </span>
    </div>
  );
}

export function CalendarMonthStats({ stats }: { stats: MonthStats }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      <Tile
        icon={IconDumbbell}
        color="var(--color-cat-strength)"
        value={String(stats.sessions)}
        label="træninger"
      />
      <Tile
        icon={IconRun}
        color="var(--color-cat-cardio)"
        value={String(stats.cardio)}
        label="løbeture"
      />
      <Tile
        icon={IconTrophy}
        color="var(--color-cat-record)"
        value={String(stats.prs)}
        label="PR'er"
      />
      {stats.completionPercent !== undefined && (
        <CompletionTile percent={stats.completionPercent} />
      )}
    </div>
  );
}
