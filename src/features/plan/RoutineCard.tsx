import { useState } from "react";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { RoutineColorPicker } from "../../components/RoutineColorPicker";
import { TextField } from "../../components/TextField";
import { ROUTINE_COLORS } from "../../db/routines";
import type { Exercise, Routine } from "../../types";

interface RoutineCardProps {
  routine: Routine;
  exercises: Exercise[];
  onUpdate: (changes: { name: string; exerciseIds: string[]; color?: string }) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function RoutineCard({ routine, exercises, onUpdate, onDelete }: RoutineCardProps) {
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
          <Button onClick={handleSave}>Gem</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[15px] font-medium text-(--color-text)">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: routine.color ?? "var(--color-accent)" }}
          />
          {routine.name}
        </span>
        <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
      </div>
      <span className="text-[13px] text-(--color-text-muted)">
        {routine.exerciseIds
          .map((id) => exerciseById.get(id)?.name)
          .filter(Boolean)
          .join(", ")}
      </span>
    </div>
  );
}
