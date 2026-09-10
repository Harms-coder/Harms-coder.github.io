import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { RoutineColorPicker } from "../../components/RoutineColorPicker";
import { TextField } from "../../components/TextField";
import {
  IconCalendar,
  IconClock,
  IconDumbbell,
  IconStar,
  type IconComponent,
} from "../../components/icons";
import { ROUTINE_COLORS } from "../../db/routines";
import { estimateWorkoutMinutes } from "../../lib/estimate";
import { joinDanish } from "../../lib/format";
import type { Exercise, Routine } from "../../types";

export interface RoutineStatus {
  text: string;
  icon: IconComponent;
  /** "planned" farves i fremgangs-grøn, resten dæmpet. */
  tone: "planned" | "muted";
}

interface RoutineCardProps {
  routine: Routine;
  exercises: Exercise[];
  status: RoutineStatus;
  onUpdate: (changes: {
    name: string;
    exerciseIds: string[];
    color?: string;
  }) => Promise<void> | void;
  onToggleFavorite: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function RoutineCard({
  routine,
  exercises,
  status,
  onUpdate,
  onToggleFavorite,
  onDelete,
}: RoutineCardProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(routine.name);
  const [exerciseIds, setExerciseIds] = useState(routine.exerciseIds);
  const [color, setColor] = useState(routine.color ?? ROUTINE_COLORS[0]);

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  function toggleExercise(exerciseId: string) {
    setExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName || exerciseIds.length === 0) return;
    await onUpdate({ name: trimmedName, exerciseIds, color });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Slet programmet "${routine.name}"? Dette kan ikke fortrydes.`)) {
      void onDelete();
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} />
        <span className="text-[13px] font-medium text-(--color-text-muted)">Øvelser</span>
        <ExerciseMultiSelect
          exercises={exercises}
          selectedIds={exerciseIds}
          onToggle={toggleExercise}
        />
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          Farve (vises i kalenderen)
        </span>
        <RoutineColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2">
          <Button tone="plan" onClick={handleSave}>
            Gem
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      </div>
    );
  }

  const exerciseNames = routine.exerciseIds
    .map((id) => exerciseById.get(id)?.name)
    .filter((n): n is string => Boolean(n));
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-3 w-3 flex-shrink-0 rounded-full"
            style={{ backgroundColor: routine.color ?? "var(--color-cat-plan)" }}
          />
          <span className="truncate text-[16px] font-bold text-(--color-text)">{routine.name}</span>
        </span>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => void onToggleFavorite()}
            aria-label={routine.favorite ? "Fjern som favorit" : "Marker som favorit"}
            className="flex h-8 w-8 items-center justify-center rounded-full active:opacity-60"
          >
            <IconStar
              className={`h-[18px] w-[18px] ${
                routine.favorite
                  ? "text-(--color-cat-history)"
                  : "text-(--color-text-muted)"
              }`}
              fill={routine.favorite ? "currentColor" : "none"}
            />
          </button>
          <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-[13px] text-(--color-text-muted)">
          <IconDumbbell className="h-3.5 w-3.5 flex-shrink-0 text-(--color-cat-library)" />
          {routine.exerciseIds.length} øvelser
        </span>
        <span className="h-3 w-px flex-shrink-0 bg-(--color-border)" />
        <span className="flex items-center gap-1.5 text-[13px] text-(--color-text-muted)">
          <IconClock className="h-3.5 w-3.5 flex-shrink-0 text-(--color-cat-goal)" />
          ca. {estimateWorkoutMinutes(routine.exerciseIds.length)} min
        </span>
        <span className="h-3 w-px flex-shrink-0 bg-(--color-border)" />
        <span
          className={`flex items-center gap-1.5 text-[13px] ${
            status.tone === "planned"
              ? "text-(--color-cat-progress)"
              : "text-(--color-text-muted)"
          }`}
        >
          <StatusIcon className="h-3.5 w-3.5 flex-shrink-0" />
          {status.text}
        </span>
      </div>

      {exerciseNames.length > 0 && (
        <span className="text-[13px] leading-snug text-(--color-text-muted)">
          {joinDanish(exerciseNames)}
        </span>
      )}

      <Button
        variant="secondary"
        size="sm"
        tone="plan"
        onClick={() => navigate("/kalender", { state: { routineId: routine.id } })}
        className="flex items-center gap-1.5 self-start"
      >
        <IconCalendar className="h-3.5 w-3.5" />
        Tilføj til kalender
      </Button>
    </div>
  );
}
