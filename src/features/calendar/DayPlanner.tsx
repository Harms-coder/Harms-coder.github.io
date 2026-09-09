import { useState } from "react";
import { Button } from "../../components/Button";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import type { Exercise, PlannedWorkout, Routine } from "../../types";

interface DayPlannerProps {
  routines: Routine[];
  exercises: Exercise[];
  plan?: PlannedWorkout;
  onSave: (input: { routineId?: string; exerciseIds: string[] }) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
}

type Mode = "routine" | "custom";

export function DayPlanner({ routines, exercises, plan, onSave, onRemove }: DayPlannerProps) {
  const [isEditing, setIsEditing] = useState(!plan);
  const [mode, setMode] = useState<Mode>(plan?.routineId ? "routine" : "custom");
  const [selectedRoutineId, setSelectedRoutineId] = useState(plan?.routineId ?? "");
  const [customExerciseIds, setCustomExerciseIds] = useState<string[]>(
    plan?.routineId ? [] : (plan?.exerciseIds ?? []),
  );

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  function toggleCustomExercise(exerciseId: string) {
    setCustomExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }

  async function handleSave() {
    if (mode === "routine") {
      const routine = routines.find((r) => r.id === selectedRoutineId);
      if (!routine) return;
      await onSave({ routineId: routine.id, exerciseIds: routine.exerciseIds });
    } else {
      if (customExerciseIds.length === 0) return;
      await onSave({ exerciseIds: customExerciseIds });
    }
    setIsEditing(false);
  }

  if (!isEditing && plan) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-text-muted)">Planlagt</span>
        <span className="text-[15px] text-(--color-text)">
          {plan.exerciseIds
            .map((id) => exerciseById.get(id)?.name)
            .filter(Boolean)
            .join(", ")}
        </span>
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Rediger
          </Button>
          <Button variant="danger" onClick={() => void onRemove()}>
            Fjern plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span className="text-[15px] font-medium text-(--color-text)">Planlæg denne dag</span>

      <div className="flex gap-1 rounded-full border border-(--color-border) bg-(--color-bg-tertiary) p-1">
        <button
          type="button"
          onClick={() => setMode("routine")}
          className={`min-h-9 flex-1 rounded-full text-[13px] font-medium ${
            mode === "routine"
              ? "accent-fill text-(--color-text)"
              : "bg-transparent text-(--color-text-muted)"
          }`}
        >
          Gruppe
        </button>
        <button
          type="button"
          onClick={() => setMode("custom")}
          className={`min-h-9 flex-1 rounded-full text-[13px] font-medium ${
            mode === "custom"
              ? "accent-fill text-(--color-text)"
              : "bg-transparent text-(--color-text-muted)"
          }`}
        >
          Vælg øvelser
        </button>
      </div>

      {mode === "routine" ? (
        routines.length === 0 ? (
          <p className="text-sm text-(--color-text-muted)">
            Du har ingen øvelsesgrupper endnu. Opret en under "Min Plan".
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {routines.map((routine) => (
              <button
                key={routine.id}
                type="button"
                onClick={() => setSelectedRoutineId(routine.id)}
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-left text-[15px] ${
                  selectedRoutineId === routine.id
                    ? "bg-(--color-accent)/15 text-(--color-accent)"
                    : "bg-(--color-surface-2) text-(--color-text)"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: routine.color ?? "var(--color-accent)" }}
                />
                {routine.name}
              </button>
            ))}
          </div>
        )
      ) : (
        <ExerciseMultiSelect
          exercises={exercises}
          selectedIds={customExerciseIds}
          onToggle={toggleCustomExercise}
        />
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={mode === "routine" ? !selectedRoutineId : customExerciseIds.length === 0}
        >
          Gem plan
        </Button>
        {plan && (
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        )}
      </div>
    </div>
  );
}
