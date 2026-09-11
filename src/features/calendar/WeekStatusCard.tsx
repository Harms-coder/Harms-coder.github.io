import type { CSSProperties } from "react";
import { IconCheck, IconDumbbell, IconFlame, IconRun, IconTarget } from "../../components/icons";
import { DA_WEEKDAYS_SHORT, parseISODate, toISODate } from "../../lib/date";
import { quoteOfTheDay } from "../../lib/quotes";
import type { CardioEntry, PlannedWorkout, WorkoutSession } from "../../types";

function MiniStat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: typeof IconCheck;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-(--color-surface-2) px-3 py-2.5">
      <span
        className="cat-badge flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border"
        style={{ "--badge-color": color } as CSSProperties}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[15px] font-bold leading-tight text-(--color-text)">{value}</span>
        <span className="truncate text-[11px] leading-tight text-(--color-text-muted)">
          {label}
        </span>
      </span>
    </div>
  );
}

interface WeekStatusCardProps {
  weekStart: string;
  sessions: WorkoutSession[];
  cardio: CardioEntry[];
  plans: PlannedWorkout[];
  streakWeeks: number;
  weeklyTarget?: number;
}

export function WeekStatusCard({
  weekStart,
  sessions,
  cardio,
  plans,
  streakWeeks,
  weeklyTarget,
}: WeekStatusCardProps) {
  const start = parseISODate(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return toISODate(date);
  });

  const activeDays = days.map(
    (iso) =>
      sessions.some((s) => s.date === iso && s.endedAt) || cardio.some((c) => c.date === iso),
  );
  const activeCount = activeDays.filter(Boolean).length;

  const weekSessions = sessions.filter(
    (s) => s.endedAt && s.date >= days[0] && s.date <= days[6],
  ).length;
  const weekCardio = cardio.filter((c) => c.date >= days[0] && c.date <= days[6]).length;
  const weekPlans = plans.filter((p) => p.date >= days[0] && p.date <= days[6]);
  const donePlans = weekPlans.filter((p) => p.status === "done").length;

  const goalPercent = weeklyTarget
    ? Math.min(100, Math.round((weekSessions / weeklyTarget) * 100))
    : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-semibold text-(--color-text)">Ugens status</span>
        {streakWeeks > 0 && (
          <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-(--color-cat-strength)">
            <IconFlame className="h-3.5 w-3.5" />
            {streakWeeks} {streakWeeks === 1 ? "uges" : "ugers"} streak
          </span>
        )}
      </div>

      {/* Én bjælke pr. ugedag — lyser hvor der var aktivitet. */}
      <div className="flex gap-1.5">
        {activeDays.map((active, index) => (
          <span key={days[index]} className="flex flex-1 flex-col items-center gap-1">
            <span
              className={`h-1.5 w-full rounded-full ${active ? "cat-bar" : "bg-(--color-surface-3)"}`}
              style={
                active
                  ? ({ "--badge-color": "var(--color-cat-progress)" } as CSSProperties)
                  : undefined
              }
            />
            <span className="text-[9.5px] text-(--color-text-muted)">
              {DA_WEEKDAYS_SHORT[index][0]}
            </span>
          </span>
        ))}
      </div>

      <span className="text-[13px] text-(--color-text-muted)">
        {activeCount} ud af 7 dage med aktivitet
      </span>

      <div className="grid grid-cols-2 gap-2">
        <MiniStat
          icon={IconDumbbell}
          color="var(--color-cat-strength)"
          value={String(weekSessions)}
          label={weekSessions === 1 ? "styrketræning" : "styrketræninger"}
        />
        <MiniStat
          icon={IconRun}
          color="var(--color-cat-cardio)"
          value={String(weekCardio)}
          label={weekCardio === 1 ? "løbetur" : "løbeture"}
        />
        <MiniStat
          icon={IconCheck}
          color="var(--color-cat-progress)"
          value={`${donePlans}/${weekPlans.length}`}
          label="planer klaret"
        />
        {goalPercent !== undefined && (
          <MiniStat
            icon={IconTarget}
            color="var(--color-cat-goal)"
            value={`${goalPercent}%`}
            label="af ugens mål"
          />
        )}
      </div>

      <p className="border-t border-(--color-border) pt-3 text-[13px] italic leading-snug text-(--color-text-secondary)">
        “{quoteOfTheDay()}” — Vigorra
      </p>
    </div>
  );
}
