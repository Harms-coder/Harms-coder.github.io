import { useState } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import type { Exercise } from "../../types";

type ExerciseUpdate = Partial<
  Pick<Exercise, "name" | "category" | "prWeight" | "prReps" | "prDate">
>;

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (changes: ExerciseUpdate) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function ExerciseCard({ exercise, onUpdate, onDelete }: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [category, setCategory] = useState(exercise.category ?? "");
  const [prWeight, setPrWeight] = useState(exercise.prWeight?.toString() ?? "");
  const [prReps, setPrReps] = useState(exercise.prReps?.toString() ?? "");

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const hasPr = prWeight.trim() !== "" || prReps.trim() !== "";
    await onUpdate({
      name: trimmedName,
      category: category.trim() || undefined,
      prWeight: prWeight.trim() ? Number(prWeight) : undefined,
      prReps: prReps.trim() ? Number(prReps) : undefined,
      prDate: hasPr ? new Date().toISOString() : undefined,
    });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Slet "${exercise.name}"? Dette kan ikke fortrydes.`)) {
      void onDelete();
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField
          label="Kategori (valgfri)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="PR – vægt (kg)"
            type="number"
            inputMode="decimal"
            value={prWeight}
            onChange={(e) => setPrWeight(e.target.value)}
          />
          <TextField
            label="PR – reps"
            type="number"
            inputMode="numeric"
            value={prReps}
            onChange={(e) => setPrReps(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Gem</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      </div>
    );
  }

  const hasPr = exercise.prWeight !== undefined || exercise.prReps !== undefined;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[15px] font-medium text-(--color-text)">
          {exercise.name}
        </span>
        {exercise.category && (
          <span className="text-[13px] text-(--color-text-muted)">{exercise.category}</span>
        )}
        {hasPr && (
          <span className="text-[13px] font-medium text-(--color-accent-green)">
            PR: {exercise.prWeight !== undefined ? `${exercise.prWeight} kg` : ""}
            {exercise.prWeight !== undefined && exercise.prReps !== undefined ? " × " : ""}
            {exercise.prReps !== undefined ? `${exercise.prReps} reps` : ""}
          </span>
        )}
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Redigér"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-2) text-(--color-text) active:opacity-70"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Slet"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-danger)/15 text-(--color-danger) active:opacity-70"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
