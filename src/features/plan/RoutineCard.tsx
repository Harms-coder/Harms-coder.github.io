import { useState } from "react";
import { Button } from "../../components/Button";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { TextField } from "../../components/TextField";
import { IconPencil, IconTrash } from "../../components/icons";
import type { Exercise, Routine } from "../../types";

interface RoutineCardProps {
  routine: Routine;
  exercises: Exercise[];
  onUpdate: (changes: { name: string; exerciseIds: string[] }) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function RoutineCard({ routine, exercises, onUpdate, onDelete }: RoutineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(routine.name);
  const [exerciseIds, setExerciseIds] = useState(routine.exerciseIds);

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
    await onUpdate({ name: trimmedName, exerciseIds });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Slet gruppen "${routine.name}"? Dette kan ikke fortrydes.`)) {
      void onDelete();
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} />
        <span className="text-[13px] font-medium text-(--color-text-muted)">Øvelser</span>
        <ExerciseMultiSelect
          exercises={exercises}
          selectedIds={exerciseIds}
          onToggle={toggleExercise}
        />
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
    <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-(--color-text)">{routine.name}</span>
        <div className="flex flex-shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Redigér"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-2) text-(--color-text) active:opacity-70"
          >
            <IconPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Slet"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-danger)/15 text-(--color-danger) active:opacity-70"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
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
