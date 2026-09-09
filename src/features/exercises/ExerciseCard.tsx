import { useState } from "react";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { CategoryPicker } from "../../components/CategoryPicker";
import { TextField } from "../../components/TextField";
import type { Exercise } from "../../types";
import { ExercisePhotoThumb } from "./ExercisePhotoThumb";

type ExerciseUpdate = Partial<
  Pick<Exercise, "name" | "category" | "prWeight" | "prReps" | "prDate" | "pr1RM" | "pr1RMDate">
>;

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdate: (changes: ExerciseUpdate) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function ExerciseCard({ exercise, onUpdate, onDelete }: ExerciseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(exercise.name);
  const [category, setCategory] = useState<string | undefined>(exercise.category);
  const [prWeight, setPrWeight] = useState(exercise.prWeight?.toString() ?? "");
  const [prReps, setPrReps] = useState(exercise.prReps?.toString() ?? "");
  const [pr1RM, setPr1RM] = useState(exercise.pr1RM?.toString() ?? "");

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const hasPr = prWeight.trim() !== "" || prReps.trim() !== "";
    const has1RM = pr1RM.trim() !== "";
    await onUpdate({
      name: trimmedName,
      category,
      prWeight: prWeight.trim() ? Number(prWeight) : undefined,
      prReps: prReps.trim() ? Number(prReps) : undefined,
      prDate: hasPr ? new Date().toISOString() : undefined,
      pr1RM: has1RM ? Number(pr1RM) : undefined,
      pr1RMDate: has1RM ? new Date().toISOString() : undefined,
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
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} />
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          Kategori (valgfri)
        </span>
        <CategoryPicker value={category} onChange={setCategory} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tungeste sæt – vægt (kg)"
            type="number"
            inputMode="decimal"
            value={prWeight}
            onChange={(e) => setPrWeight(e.target.value)}
          />
          <TextField
            label="Tungeste sæt – reps"
            type="number"
            inputMode="numeric"
            value={prReps}
            onChange={(e) => setPrReps(e.target.value)}
          />
        </div>
        <TextField
          label="1RM (kg) – hvad du kan tage i én rep"
          type="number"
          inputMode="decimal"
          value={pr1RM}
          onChange={(e) => setPr1RM(e.target.value)}
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

  const hasPr = exercise.prWeight !== undefined || exercise.prReps !== undefined;

  return (
    <div className="flex min-h-28 items-stretch overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) card-shadow">
      <ExercisePhotoThumb exercise={exercise} />
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-[15px] font-medium text-(--color-text)">
            {exercise.name}
          </span>
          {exercise.category && (
            <span className="text-[13px] text-(--color-text-muted)">{exercise.category}</span>
          )}
          {hasPr && (
            <span className="text-[13px] font-medium text-(--color-accent-glow)">
              Tungeste sæt: {exercise.prWeight !== undefined ? `${exercise.prWeight} kg` : ""}
              {exercise.prWeight !== undefined && exercise.prReps !== undefined ? " × " : ""}
              {exercise.prReps !== undefined ? `${exercise.prReps}` : ""}
            </span>
          )}
          {exercise.pr1RM !== undefined && (
            <span className="text-[13px] font-medium text-(--color-text-secondary)">
              1RM: {exercise.pr1RM} kg
            </span>
          )}
        </div>
        <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
      </div>
    </div>
  );
}
