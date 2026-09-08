import { Link } from "react-router-dom";
import type { Exercise } from "../../types";

interface ExercisePickerProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExercisePicker({ exercises, onSelect, onClose }: ExercisePickerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
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
          Du har ingen flere øvelser at tilføje.{" "}
          <Link to="/oevelser" className="text-(--color-accent)">
            Opret en øvelse
          </Link>{" "}
          i biblioteket.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {exercises.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise)}
              className="min-h-11 rounded-xl bg-(--color-surface-2) px-3.5 text-left text-[15px] text-(--color-text) active:opacity-70"
            >
              {exercise.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
