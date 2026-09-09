import { useMemo, useState } from "react";
import { filterExercises } from "../lib/exerciseFilter";
import type { Exercise } from "../types";
import { ExerciseFilterBar } from "./ExerciseFilterBar";
import { IconCheck } from "./icons";

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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterExercises(exercises, category, query),
    [exercises, category, query],
  );

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-(--color-text-muted)">
        Du har ingen øvelser i biblioteket endnu.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ExerciseFilterBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
      />
      <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-(--color-text-muted)">Ingen øvelser matcher.</p>
        ) : (
          filtered.map((exercise) => {
            const isSelected = selectedIds.includes(exercise.id);
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onToggle(exercise.id)}
                className={`flex min-h-11 flex-shrink-0 items-center justify-between rounded-xl px-3.5 text-left text-[15px] ${
                  isSelected
                    ? "bg-(--color-accent)/15 text-(--color-accent)"
                    : "glass-fill text-(--color-text)"
                }`}
              >
                <span>{exercise.name}</span>
                {isSelected && <IconCheck className="h-4 w-4" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
