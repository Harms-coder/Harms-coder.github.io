import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExerciseFilterBar } from "../../components/ExerciseFilterBar";
import { ExerciseIcon } from "../../components/ExerciseIcon";
import { filterExercises } from "../../lib/exerciseFilter";
import type { Exercise } from "../../types";

interface ExercisePickerProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ exercises, onSelect, onClose }: ExercisePickerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterExercises(exercises, category, query),
    [exercises, category, query],
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-medium text-(--color-text)">Vælg øvelse</span>
        <button
          type="button"
          onClick={onClose}
          className="text-[13px] text-(--color-text-muted)"
        >
          Luk
        </button>
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen øvelser endnu.{" "}
          <Link to="/oevelser" className="text-(--color-accent)">
            Opret en øvelse
          </Link>{" "}
          for at komme i gang.
        </p>
      ) : (
        <>
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
              filtered.map((exercise) => (
                <button
                  key={exercise.id}
                  type="button"
                  onClick={() => onSelect(exercise)}
                  className="flex min-h-11 flex-shrink-0 items-center gap-2.5 rounded-xl glass-fill px-3 text-left text-[15px] text-(--color-text) active:opacity-70"
                >
                  <ExerciseIcon exercise={exercise} size={36} />
                  {exercise.name}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
