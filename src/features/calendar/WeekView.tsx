import type { CSSProperties } from "react";
import { IconChevronRight, IconRun } from "../../components/icons";
import { DA_WEEKDAYS_SHORT, parseISODate, toISODate } from "../../lib/date";
import type { CardioEntry, Exercise, PlannedWorkout, Routine, WorkoutSession } from "../../types";

interface WeekViewProps {
  weekStart: string;
  selectedDate: string;
  plans: PlannedWorkout[];
  sessions: WorkoutSession[];
  cardio: CardioEntry[];
  routineById: Map<string, Routine>;
  exerciseById: Map<string, Exercise>;
  onSelect: (date: string) => void;
}

/**
 * Ugen som en liste frem for et gitter. En månedskalender er god til overblik, men når
 * man planlægger, vil man læse "mandag: Push, onsdag: løb" — og det kræver navne, ikke prikker.
 */
export function WeekView({
  weekStart,
  selectedDate,
  plans,
  sessions,
  cardio,
  routineById,
  exerciseById,
  onSelect,
}: WeekViewProps) {
  const start = parseISODate(weekStart);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return toISODate(date);
  });

  return (
    <div className="flex flex-col gap-2">
      {days.map((iso, index) => {
        const plan = plans.find((p) => p.date === iso);
        const routine = plan?.routineId ? routineById.get(plan.routineId) : undefined;
        const dayCardio = cardio.filter((c) => c.date === iso);
        const done = sessions.some((s) => s.date === iso && s.endedAt);
        const color = routine?.color ?? "var(--color-cat-plan)";

        const title =
          routine?.name ??
          (plan
            ? [
                ...new Set(
                  plan.exerciseIds
                    .map((id) => exerciseById.get(id)?.category)
                    .filter((c): c is string => Boolean(c)),
                ),
              ].join(", ") || "Planlagt træning"
            : undefined);

        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left card-shadow ${
              iso === selectedDate
                ? "border-(--color-border-strong) bg-(--color-surface-2)"
                : "border-(--color-border) bg-(--color-surface)"
            }`}
          >
            <span className="flex w-11 flex-shrink-0 flex-col items-center">
              <span className="text-[11px] font-medium text-(--color-text-muted)">
                {DA_WEEKDAYS_SHORT[index]}
              </span>
              <span className="text-[16px] font-bold text-(--color-text)">
                {parseISODate(iso).getDate()}
              </span>
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              {title ? (
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: color } as CSSProperties}
                  />
                  <span className="truncate text-[15px] font-semibold text-(--color-text)">
                    {title}
                  </span>
                </span>
              ) : (
                <span className="text-[14px] text-(--color-text-muted)">Ingen plan</span>
              )}

              <span className="flex flex-wrap items-center gap-2">
                {done && (
                  <span className="text-[12px] font-medium text-(--color-cat-progress)">
                    Gennemført
                  </span>
                )}
                {dayCardio.map((entry) => (
                  <span
                    key={entry.id}
                    className="flex items-center gap-1 text-[12px] font-medium text-(--color-cat-cardio)"
                  >
                    <IconRun className="h-3.5 w-3.5" />
                    {entry.distanceKm} km
                  </span>
                ))}
              </span>
            </span>

            <IconChevronRight className="h-4 w-4 flex-shrink-0 text-(--color-text-muted)" />
          </button>
        );
      })}
    </div>
  );
}
