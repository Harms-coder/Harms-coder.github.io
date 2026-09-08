import type { Exercise } from "../types";

interface ExerciseMultiSelectProps {
  exercises: Exercise[];
  selectedIds: string[];
  onToggle: (exerciseId: string) => void;
}

export function ExerciseMultiSelect({
  exercises,
  selectedIds,
  onToggle,
}: ExerciseMultiSelectProps) {
  if (exercises.length === 0) {
    return (
      <p className="text-sm text-(--color-text-muted)">
        Du har ingen øvelser i biblioteket endnu.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {exercises.map((exercise) => {
        const isSelected = selectedIds.includes(exercise.id);
        return (
          <button
            key={exercise.id}
            type="button"
            onClick={() => onToggle(exercise.id)}
            className={`flex min-h-11 items-center justify-between rounded-xl px-3.5 text-left text-[15px] ${
              isSelected
                ? "bg-(--color-accent)/15 text-(--color-accent)"
                : "bg-(--color-surface-2) text-(--color-text)"
            }`}
          >
            <span>{exercise.name}</span>
            {isSelected && <span>✓</span>}
          </button>
        );
      })}
    </div>
  );
}
