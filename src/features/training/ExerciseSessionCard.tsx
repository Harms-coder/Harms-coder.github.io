import type { Exercise, SetEntry, SetType } from "../../types";
import { SetInputForm } from "./SetInputForm";

const SET_TYPE_BADGE: Record<SetType, string | null> = {
  normal: null,
  warmup: "Varm op",
  dropset: "Drop sæt",
  "1rm": "1RM",
};

interface ExerciseSessionCardProps {
  exercise: Exercise;
  sets: SetEntry[];
  expanded: boolean;
  initialWeight?: number;
  initialReps?: number;
  onToggle: () => void;
  onAddSet: (values: { weight: number; reps: number; setType: SetType }) => void;
  onDeleteSet: (setId: string) => void;
}

export function ExerciseSessionCard({
  exercise,
  sets,
  expanded,
  initialWeight,
  initialReps,
  onToggle,
  onAddSet,
  onDeleteSet,
}: ExerciseSessionCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between text-left"
      >
        <div className="flex flex-col">
          <span className="text-[15px] font-medium text-(--color-text)">{exercise.name}</span>
          <span className="text-[13px] text-(--color-text-muted)">
            {sets.length === 0 ? "Ingen sæt endnu" : `${sets.length} sæt`}
          </span>
        </div>
        <span className="text-(--color-text-muted)">{expanded ? "︿" : "﹀"}</span>
      </button>

      {sets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {sets.map((set, index) => (
            <div
              key={set.id}
              className="flex items-center justify-between text-[14px] text-(--color-text)"
            >
              <span>
                Sæt {index + 1}: {set.weight} kg × {set.reps}
                {SET_TYPE_BADGE[set.setType] && (
                  <span className="ml-2 text-[12px] text-(--color-text-muted)">
                    {SET_TYPE_BADGE[set.setType]}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => onDeleteSet(set.id)}
                aria-label="Slet sæt"
                className="text-(--color-text-muted) active:opacity-60"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {expanded && (
        <SetInputForm initialWeight={initialWeight} initialReps={initialReps} onSave={onAddSet} />
      )}
    </div>
  );
}
