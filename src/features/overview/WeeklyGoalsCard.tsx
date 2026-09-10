import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight, IconDumbbell, IconRun, type IconComponent } from "../../components/icons";
import type { GoalProgress } from "../../lib/goalProgress";

/** Ikon og farve pr. ugentlig måltype, så rækkerne kan skelnes på farven alene. */
const ROW_STYLE: Record<string, { icon: IconComponent; color: string }> = {
  sessionsPerWeek: { icon: IconDumbbell, color: "var(--color-cat-strength)" },
  distanceKmPerWeek: { icon: IconRun, color: "var(--color-cat-cardio)" },
};

interface WeeklyGoalsCardProps {
  goals: GoalProgress[];
}

/** Samler ugens mål i ét kort med en progress-bar pr. mål, som på Oversigt-mockuppen. */
export function WeeklyGoalsCard({ goals }: WeeklyGoalsCardProps) {
  const achieved = goals.filter((g) => g.achieved).length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[16px] font-bold text-(--color-text)">Ugens mål</span>
        <Link
          to="/mal"
          className="flex items-center gap-1 text-[12.5px] font-medium text-(--color-text-muted) active:opacity-70"
        >
          {achieved}/{goals.length} færdiggjort
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {goals.map((goal) => {
        const style = ROW_STYLE[goal.goal.type] ?? {
          icon: IconDumbbell,
          color: "var(--color-cat-goal)",
        };
        const Icon = style.icon;
        return (
          <div key={goal.goal.id} className="flex items-center gap-3">
            <span
              className="cat-badge flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border"
              style={{ "--badge-color": style.color } as CSSProperties}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color: style.color }} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14px] font-medium text-(--color-text)">
                  {goal.label}
                </span>
                <span className="flex-shrink-0 text-[13px] text-(--color-text-muted)">
                  {goal.statusText}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
                <div
                  className="cat-bar h-full rounded-full"
                  style={
                    {
                      width: `${Math.max(3, goal.percent)}%`,
                      "--badge-color": style.color,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
