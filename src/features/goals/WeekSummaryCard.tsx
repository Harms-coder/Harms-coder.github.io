import type { CSSProperties } from "react";
import { IconChevronRight, IconTrophy } from "../../components/icons";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Kort "X tilbage"-beskrivelse af et ikke-nået måls resterende afstand, til opsummeringens undertekst. */
function describeRemaining(progress: GoalProgressData): string | undefined {
  if (progress.achieved) return undefined;
  const remaining = round1(progress.target - progress.current);
  if (remaining <= 0) return undefined;

  switch (progress.goal.type) {
    case "sessionsPerWeek":
      return `${remaining} træning${remaining === 1 ? "" : "er"}`;
    case "distanceKmPerWeek":
      return `${remaining} km`;
    case "bodyweight":
      return `${remaining} kg`;
    case "exerciseWeight":
    case "exercise1RM":
      return `${remaining} kg`;
  }
}

interface WeekSummaryCardProps {
  progressList: GoalProgressData[];
}

/** Opsummerer ugens mål-status øverst på Mål-siden: "X af Y mål er på rette vej" + hvad der mangler. */
export function WeekSummaryCard({ progressList }: WeekSummaryCardProps) {
  const total = progressList.length;
  const onTrack = progressList.filter((p) => p.percent > 0).length;
  const remainingParts = progressList
    .map(describeRemaining)
    .filter((part): part is string => Boolean(part));
  const allDone = total > 0 && onTrack === total && remainingParts.length === 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span
        className="cat-fill flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
        style={{ "--badge-color": "var(--color-cat-record)" } as CSSProperties}
      >
        <IconTrophy className="h-5 w-5 text-(--color-text)" />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-[12.5px] font-medium text-(--color-text-muted)">Denne uge</span>
        <span className="text-[15px] font-semibold text-(--color-text)">
          {onTrack} af {total} mål er på rette vej
        </span>
        {remainingParts.length > 0 && (
          <span className="text-[12.5px] text-(--color-text-muted)">
            {remainingParts.join(" · ")} tilbage
          </span>
        )}
      </div>
      <div className="h-10 w-px flex-shrink-0 bg-(--color-border-accent)" />
      <div className="flex items-center gap-1.5">
        <span className="max-w-24 text-right text-[13px] font-medium text-(--color-text-secondary)">
          {allDone ? "Alle mål nået!" : "Fortsæt det gode arbejde!"}
        </span>
        <IconChevronRight className="h-4 w-4 flex-shrink-0 text-(--color-text-muted)" />
      </div>
    </div>
  );
}
