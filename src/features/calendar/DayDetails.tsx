import { useState, type CSSProperties } from "react";
import { Button } from "../../components/Button";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconList,
  IconPencil,
  IconPlay,
  IconRun,
  IconScale,
  IconTarget,
  IconTrash,
  type IconComponent,
} from "../../components/icons";
import { estimateWorkoutMinutes } from "../../lib/estimate";
import { formatPace } from "../../lib/format";
import { toISODate } from "../../lib/date";
import type {
  BodyweightEntry,
  CardioEntry,
  Exercise,
  PlannedStatus,
  PlannedWorkout,
  Routine,
  SetEntry,
  WorkoutSession,
} from "../../types";

const STATUS_LABELS: Record<PlannedStatus, string> = {
  planned: "Planlagt",
  done: "Gennemført",
  postponed: "Udsat",
  skipped: "Sprunget over",
};

const STATUS_COLORS: Record<PlannedStatus, string> = {
  planned: "var(--color-cat-plan)",
  done: "var(--color-cat-progress)",
  postponed: "var(--color-cat-history)",
  skipped: "var(--color-text-muted)",
};

function Chip({ icon: Icon, text, color }: { icon?: IconComponent; text: string; color?: string }) {
  return (
    <span
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium"
      style={
        {
          "--badge-color": color ?? "var(--color-border-strong)",
          borderColor: color
            ? `color-mix(in srgb, ${color} 45%, transparent)`
            : "var(--color-border)",
          color: color ?? "var(--color-text-muted)",
          background: color ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
        } as CSSProperties
      }
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {text}
    </span>
  );
}

/** Ét kort i dagens tidslinje — bruges til gennemført træning, løbetur, vejning og note. */
function TimelineCard({
  icon: Icon,
  color,
  title,
  lines,
}: {
  icon: IconComponent;
  color: string;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span
        className="cat-badge flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border"
        style={{ "--badge-color": color } as CSSProperties}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[15px] font-semibold text-(--color-text)">{title}</span>
        {lines.map((line) => (
          <span key={line} className="text-[13px] leading-snug text-(--color-text-muted)">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

interface DayDetailsProps {
  date: string;
  plan?: PlannedWorkout;
  routine?: Routine;
  exerciseById: Map<string, Exercise>;
  sessions: WorkoutSession[];
  sets: SetEntry[];
  cardio: CardioEntry[];
  bodyweight?: BodyweightEntry;
  /** Hvor mange træninger der mangler for at nå ugemålet, hvis der findes et. */
  goalRemaining?: number;
  onStart: () => void;
  onEdit: () => void;
  onMove: (toDate: string) => void;
  onDelete: () => void;
  onStatus: (status: PlannedStatus) => void;
}

export function DayDetails({
  date,
  plan,
  routine,
  exerciseById,
  sessions,
  sets,
  cardio,
  bodyweight,
  goalRemaining,
  onStart,
  onEdit,
  onMove,
  onDelete,
  onStatus,
}: DayDetailsProps) {
  const [moveTo, setMoveTo] = useState<string | null>(null);

  const status: PlannedStatus = plan?.status ?? "planned";
  const planExercises = plan?.exerciseIds.map((id) => exerciseById.get(id)).filter(Boolean) ?? [];
  const categories = [
    ...new Set(planExercises.map((e) => e?.category).filter((c): c is string => Boolean(c))),
  ];
  const planColor = routine?.color ?? "var(--color-cat-plan)";
  const isToday = date === toISODate(new Date());

  const completedSessions = sessions.filter((s) => s.endedAt);
  const hasAnything =
    plan || completedSessions.length > 0 || cardio.length > 0 || bodyweight || false;

  if (!hasAnything) return null;

  return (
    <div className="flex flex-col gap-3">
      {plan && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <div className="flex items-start gap-3">
            <span
              className="cat-badge flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border"
              style={{ "--badge-color": planColor } as CSSProperties}
            >
              <IconCalendar className="h-6 w-6" style={{ color: planColor }} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-[17px] font-bold text-(--color-text)">
                {routine?.name ?? "Planlagt træning"}
              </span>
              {categories.length > 0 && (
                <span className="truncate text-[13px] text-(--color-text-muted)">
                  {categories.join(", ")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Chip icon={IconList} text={`${plan.exerciseIds.length} øvelser`} />
            <Chip
              icon={IconClock}
              text={`ca. ${estimateWorkoutMinutes(plan.exerciseIds.length)} min`}
            />
            <Chip
              icon={status === "done" ? IconCheck : IconTarget}
              text={status === "planned" && isToday ? "Klar i dag" : STATUS_LABELS[status]}
              color={STATUS_COLORS[status]}
            />
          </div>

          {goalRemaining !== undefined && goalRemaining > 0 && status !== "done" && (
            <span className="text-[13px] text-(--color-cat-goal)">
              +1 træning mod ugemålet — {goalRemaining}{" "}
              {goalRemaining === 1 ? "mangler" : "mangler"}
            </span>
          )}

          <div className="flex flex-wrap gap-2">
            {status !== "done" && (
              <Button
                size="sm"
                tone="strength"
                onClick={onStart}
                className="flex items-center gap-1.5"
              >
                <IconPlay className="h-3.5 w-3.5" />
                Start træning
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={onEdit}
              className="flex items-center gap-1.5"
            >
              <IconPencil className="h-3.5 w-3.5" />
              Rediger
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setMoveTo(moveTo === null ? date : null)}
              className="flex items-center gap-1.5"
            >
              <IconCalendar className="h-3.5 w-3.5" />
              Flyt
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={onDelete}
              className="flex items-center gap-1.5"
            >
              <IconTrash className="h-3.5 w-3.5" />
              Slet
            </Button>
          </div>

          {moveTo !== null && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-(--color-surface-2) p-3">
              <span className="text-[13px] text-(--color-text-muted)">Flyt til</span>
              <input
                type="date"
                value={moveTo}
                onChange={(e) => setMoveTo(e.target.value)}
                className="min-h-9 rounded-lg border border-transparent bg-(--color-surface-2) px-2.5 text-[14px] text-(--color-text) outline-none"
              />
              <Button
                size="sm"
                tone="plan"
                disabled={moveTo === date}
                onClick={() => {
                  onMove(moveTo);
                  setMoveTo(null);
                }}
              >
                Flyt
              </Button>
            </div>
          )}

          {/* Status sættes manuelt, fordi en plan kan ende på måder appen ikke kan se. */}
          {status !== "done" && (
            <div className="flex flex-wrap gap-2 border-t border-(--color-border) pt-3">
              <button
                type="button"
                onClick={() => onStatus("done")}
                className="text-[12.5px] font-medium text-(--color-cat-progress) active:opacity-60"
              >
                Marker som gennemført
              </button>
              <span className="text-(--color-border-strong)">·</span>
              <button
                type="button"
                onClick={() => onStatus("skipped")}
                className="text-[12.5px] font-medium text-(--color-text-muted) active:opacity-60"
              >
                Sprunget over
              </button>
            </div>
          )}
        </div>
      )}

      {completedSessions.map((session) => {
        const sessionSets = sets.filter((s) => s.sessionId === session.id);
        const names = [
          ...new Set(
            sessionSets
              .map((s) => exerciseById.get(s.exerciseId)?.name)
              .filter((n): n is string => Boolean(n)),
          ),
        ];
        return (
          <TimelineCard
            key={session.id}
            icon={IconCheck}
            color="var(--color-cat-strength)"
            title="Gennemført træning"
            lines={[
              [
                session.durationMin ? `${session.durationMin} min` : undefined,
                `${sessionSets.length} sæt`,
                names.length > 0 ? `${names.length} øvelser` : undefined,
              ]
                .filter(Boolean)
                .join(" · "),
              ...(names.length > 0 ? [names.join(", ")] : []),
              ...(session.notes ? [session.notes] : []),
            ]}
          />
        );
      })}

      {cardio.map((entry) => (
        <TimelineCard
          key={entry.id}
          icon={IconRun}
          color="var(--color-cat-cardio)"
          title={entry.activity}
          lines={[
            `${entry.distanceKm} km · ${entry.durationMin} min · ${formatPace(entry.distanceKm, entry.durationMin)}`,
          ]}
        />
      ))}

      {bodyweight && (
        <TimelineCard
          icon={IconScale}
          color="var(--color-cat-body)"
          title="Kropsvægt"
          lines={[`${bodyweight.weight} kg`]}
        />
      )}
    </div>
  );
}
