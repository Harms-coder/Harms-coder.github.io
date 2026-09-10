import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { formatMediumDate, parseISODate } from "../../lib/date";
import {
  IconActivity,
  IconCalendar,
  IconClipboard,
  IconClock,
  IconDumbbell,
  IconFlame,
  IconLightbulb,
  IconList,
  IconTarget,
  IconTrendUp,
  type IconComponent,
} from "../../components/icons";

const MIN_PER_EXERCISE_LOW = 6;
const MIN_PER_EXERCISE_HIGH = 8;

function IconBadge({ icon: Icon, accent }: { icon: IconComponent; accent: string }) {
  return (
    <span
      className="cat-badge flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
      style={{ "--badge-color": accent } as CSSProperties}
    >
      <Icon className="h-5 w-5" style={{ color: accent }} />
    </span>
  );
}

function StatItem({ icon: Icon, text, accent }: { icon: IconComponent; text: string; accent: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[13px] text-(--color-text-muted)">
      <Icon className="h-4 w-4 flex-shrink-0" style={{ color: accent }} />
      {text}
    </span>
  );
}

/** Stat-linje med en tynd, næsten umærkelig skillelinje mellem hvert element. */
function StatRow({ items, accent }: { items: { icon: IconComponent; text: string }[]; accent: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          {i > 0 && <span className="h-3 w-px flex-shrink-0 bg-(--color-border)" />}
          <StatItem icon={item.icon} text={item.text} accent={accent} />
        </div>
      ))}
    </div>
  );
}

interface PlanInfo {
  title: string;
  exerciseCount: number;
  categoryCount: number;
  categoriesLine?: string;
}

interface LastSessionInfo {
  title: string;
  durationMin?: number;
  setCount: number;
  dateLabel: string;
}

interface TrainingIdleViewProps {
  onStart: () => void;
  completedToday: boolean;
  plan?: PlanInfo;
  nextPlanDate?: string;
  lastSession?: LastSessionInfo;
  weekSessionCount: number;
  streakDays: number;
  goalRemaining?: number;
}

/** Dashboard vist på Træning-fanen når der ikke er en aktiv træning. */
export function TrainingIdleView({
  onStart,
  completedToday,
  plan,
  nextPlanDate,
  lastSession,
  weekSessionCount,
  streakDays,
  goalRemaining,
}: TrainingIdleViewProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6 text-left">
      <PageBackdrop image="/images/traening-gym.jpg" imagePosition="center 55%" />
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-(--color-text)">Træning</h1>
        <p className="text-[13px] text-(--color-text-secondary)">
          Start en træning for at logge sæt, følge tiden og se dine øvelser.
        </p>
      </div>
      <Button onClick={onStart} tone="strength" className="self-center">
        Start træning
      </Button>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <IconBadge icon={IconDumbbell} accent="var(--color-cat-strength)" />
            <span className="text-[16px] font-bold text-(--color-text)">Dagens plan</span>
          </div>
          {plan && (
            <span className="cat-badge flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[12px] font-medium"
              style={{ "--badge-color": "var(--color-cat-progress)", color: "var(--color-cat-progress)" } as CSSProperties}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} />
              Klar i dag
            </span>
          )}
        </div>

        {plan ? (
          <Link to="/kalender" className="flex flex-col gap-2 active:opacity-70">
            <span className="text-[15px] font-semibold text-(--color-text)">{plan.title}</span>
            <StatRow
              accent="var(--color-cat-strength)"
              items={[
                { icon: IconList, text: `${plan.exerciseCount} øvelser` },
                {
                  icon: IconClock,
                  text: `${plan.exerciseCount * MIN_PER_EXERCISE_LOW}-${plan.exerciseCount * MIN_PER_EXERCISE_HIGH} min`,
                },
                ...(plan.categoryCount > 0
                  ? [{ icon: IconActivity, text: `${plan.categoryCount} muskelgrupper` }]
                  : []),
              ]}
            />
            {plan.categoriesLine && (
              <span className="text-[13px] text-(--color-text-muted)">{plan.categoriesLine}</span>
            )}
          </Link>
        ) : completedToday ? (
          <span className="text-[13px] text-(--color-success)">
            Godt klaret! Du har allerede trænet i dag.
          </span>
        ) : (
          <span className="text-[13px] text-(--color-text-muted)">
            {nextPlanDate
              ? `Ingen plan for i dag. Næste planlagte pas er ${formatMediumDate(parseISODate(nextPlanDate))}.`
              : "Ingen plan for i dag. Læg en plan under Programmer eller Kalender, eller start en fri træning."}
          </span>
        )}
      </div>

      {lastSession && (
        <Link
          to="/historik"
          className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow active:opacity-70"
        >
          <div className="flex items-center gap-3">
            <IconBadge icon={IconActivity} accent="var(--color-cat-record)" />
            <span className="text-[16px] font-bold text-(--color-text)">Sidste træning</span>
          </div>
          <span className="text-[15px] font-semibold text-(--color-text)">{lastSession.title}</span>
          <StatRow
            accent="var(--color-cat-record)"
            items={[
              ...(lastSession.durationMin !== undefined
                ? [{ icon: IconClock, text: `${lastSession.durationMin} min` }]
                : []),
              { icon: IconClipboard, text: `${lastSession.setCount} sæt` },
              { icon: IconCalendar, text: lastSession.dateLabel },
            ]}
          />
        </Link>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center gap-3">
          <IconBadge icon={IconTrendUp} accent="var(--color-cat-progress)" />
          <span className="text-[16px] font-bold text-(--color-text)">Hurtigt overblik</span>
        </div>
        <div className="flex items-stretch justify-between">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-(--color-text-muted)">
              <IconCalendar className="h-3.5 w-3.5" style={{ color: "var(--color-cat-goal)" }} />
              Denne uge
            </span>
            <span className="text-[15px] font-bold text-(--color-text)">
              {weekSessionCount} træning{weekSessionCount === 1 ? "" : "er"}
            </span>
          </div>
          <div className="w-px flex-shrink-0 bg-(--color-border)" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-(--color-text-muted)">
              <IconFlame className="h-3.5 w-3.5" style={{ color: "var(--color-cat-strength)" }} />
              Streak
            </span>
            <span className="text-[15px] font-bold text-(--color-text)">{streakDays} dage</span>
          </div>
          <div className="w-px flex-shrink-0 bg-(--color-border)" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex items-center gap-1.5 text-[12px] text-(--color-text-muted)">
              <IconTarget className="h-3.5 w-3.5" style={{ color: "var(--color-cat-progress)" }} />
              Næste mål
            </span>
            <span className="text-[15px] font-bold text-(--color-text)">
              {goalRemaining === undefined
                ? "–"
                : goalRemaining <= 0
                  ? "Nået"
                  : `${goalRemaining} tilbage`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <IconBadge icon={IconLightbulb} accent="var(--color-cat-goal)" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[16px] font-bold text-(--color-text)">Tip</span>
          <span className="text-[13px] text-(--color-text-muted)">
            Start træningen, så får du adgang til øvelser, sættæller og varighed med det samme.
          </span>
        </div>
      </div>
    </div>
  );
}
