import type { CSSProperties } from "react";
import { IconCalendar, IconChevronRight } from "../../components/icons";
import { DA_MONTHS, DA_WEEKDAYS_SHORT, parseISODate } from "../../lib/date";
import type { Exercise, PlannedWorkout, Routine } from "../../types";

const MAX_SHOWN = 5;

/** "11. sep" — årstal udelades, da listen kun rækker få uger frem og ellers ombryder. */
function shortDate(date: Date): string {
  return `${date.getDate()}. ${DA_MONTHS[date.getMonth()].slice(0, 3)}`;
}

interface UpcomingWorkoutsProps {
  plans: PlannedWorkout[];
  today: string;
  routineById: Map<string, Routine>;
  exerciseById: Map<string, Exercise>;
  onSelect: (date: string) => void;
}

/** De næste planlagte dage, så man kan se hvad der venter uden at bladre i kalenderen. */
export function UpcomingWorkouts({
  plans,
  today,
  routineById,
  exerciseById,
  onSelect,
}: UpcomingWorkoutsProps) {
  const upcoming = plans
    .filter((plan) => plan.date > today && plan.status !== "skipped")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_SHOWN);

  if (upcoming.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center gap-2">
        <span
          className="cat-badge flex h-8 w-8 items-center justify-center rounded-full border"
          style={{ "--badge-color": "var(--color-cat-plan)" } as CSSProperties}
        >
          <IconCalendar className="h-4 w-4 text-(--color-cat-plan)" />
        </span>
        <span className="text-[15px] font-semibold text-(--color-text)">Kommende træninger</span>
      </div>

      <div className="flex flex-col">
        {upcoming.map((plan, index) => {
          const routine = plan.routineId ? routineById.get(plan.routineId) : undefined;
          const date = parseISODate(plan.date);
          const categories = [
            ...new Set(
              plan.exerciseIds
                .map((id) => exerciseById.get(id)?.category)
                .filter((c): c is string => Boolean(c)),
            ),
          ].join(", ");
          const title = routine?.name ?? (categories || "Planlagt træning");

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelect(plan.date)}
              className={`flex min-h-11 items-center gap-3 text-left active:opacity-70 ${
                index > 0 ? "border-t border-(--color-border)" : ""
              }`}
            >
              <span className="w-9 flex-shrink-0 text-[12.5px] font-medium text-(--color-text-muted)">
                {DA_WEEKDAYS_SHORT[(date.getDay() + 6) % 7]}
              </span>
              <span className="w-14 flex-shrink-0 text-[12.5px] text-(--color-text-secondary)">
                {shortDate(date)}
              </span>
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ backgroundColor: routine?.color ?? "var(--color-cat-plan)" }}
              />
              <span className="min-w-0 flex-1 truncate text-[14px] text-(--color-text)">
                {title}
              </span>
              <IconChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-(--color-text-muted)" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
