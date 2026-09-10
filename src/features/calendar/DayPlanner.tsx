import { useState, type CSSProperties } from "react";
import { Button } from "../../components/Button";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { IconCalendar } from "../../components/icons";
import { SegmentedControl } from "../../components/SegmentedControl";
import { DA_WEEKDAYS, parseISODate } from "../../lib/date";
import type { Exercise, PlannedWorkout, Routine } from "../../types";

interface DayPlannerProps {
  /** Den valgte dag, ISO — bruges til at navngive ugedagen i gentagelses-valget. */
  date: string;
  routines: Routine[];
  exercises: Exercise[];
  plan?: PlannedWorkout;
  /** Forvalgt program, når man kommer fra "Tilføj til kalender" på Programmer-siden. */
  preselectRoutineId?: string;
  onSave: (input: {
    routineId?: string;
    exerciseIds: string[];
    /** Antal uger planen gentages, inkl. den valgte dag. 1 = kun denne dag. */
    occurrences: number;
  }) => Promise<void> | void;
  onRemove: () => Promise<void> | void;
}

type Mode = "routine" | "custom";

const MODE_OPTIONS: { value: Mode; label: string }[] = [
  { value: "routine", label: "Program" },
  { value: "custom", label: "Vælg øvelser" },
];

type RepeatKey = "1" | "4" | "8" | "12";

const REPEAT_OPTIONS: { value: RepeatKey; label: string }[] = [
  { value: "1", label: "Kun denne dag" },
  { value: "4", label: "4 uger" },
  { value: "8", label: "8 uger" },
  { value: "12", label: "12 uger" },
];

export function DayPlanner({
  date,
  routines,
  exercises,
  plan,
  preselectRoutineId,
  onSave,
  onRemove,
}: DayPlannerProps) {
  const [isEditing, setIsEditing] = useState(!plan);
  const [mode, setMode] = useState<Mode>(
    plan?.routineId || (!plan && preselectRoutineId) ? "routine" : "custom",
  );
  const [selectedRoutineId, setSelectedRoutineId] = useState(
    plan?.routineId ?? (plan ? "" : (preselectRoutineId ?? "")),
  );
  const [repeat, setRepeat] = useState<RepeatKey>("1");
  const [customExerciseIds, setCustomExerciseIds] = useState<string[]>(
    plan?.routineId ? [] : (plan?.exerciseIds ?? []),
  );

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const weekdayName = DA_WEEKDAYS[parseISODate(date).getDay()];

  function toggleCustomExercise(exerciseId: string) {
    setCustomExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }

  async function handleSave() {
    const occurrences = Number(repeat);
    if (mode === "routine") {
      const routine = routines.find((r) => r.id === selectedRoutineId);
      if (!routine) return;
      await onSave({ routineId: routine.id, exerciseIds: routine.exerciseIds, occurrences });
    } else {
      if (customExerciseIds.length === 0) return;
      await onSave({ exerciseIds: customExerciseIds, occurrences });
    }
    setIsEditing(false);
  }

  if (!isEditing && plan) {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center gap-2">
          <span
            className="cat-badge flex h-8 w-8 items-center justify-center rounded-full border"
            style={{ "--badge-color": "var(--color-cat-plan)" } as CSSProperties}
          >
            <IconCalendar className="h-4 w-4 text-(--color-cat-plan)" />
          </span>
          <span className="text-[14px] font-semibold text-(--color-text)">Planlagt</span>
        </div>
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

      <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} tone="plan" />

      {mode === "routine" ? (
        routines.length === 0 ? (
          <p className="text-sm text-(--color-text-muted)">
            Du har ingen programmer endnu. Opret et under "Programmer".
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {routines.map((routine) => (
              <button
                key={routine.id}
                type="button"
                onClick={() => setSelectedRoutineId(routine.id)}
                style={
                  {
                    "--badge-color": routine.color ?? "var(--color-cat-plan)",
                  } as CSSProperties
                }
                className={`flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-left text-[15px] ${
                  selectedRoutineId === routine.id
                    ? "cat-badge border font-medium text-(--color-text)"
                    : "glass-fill text-(--color-text)"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: routine.color ?? "var(--color-cat-plan)" }}
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

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          Gentag hver {weekdayName.toLowerCase()}
        </span>
        <SegmentedControl options={REPEAT_OPTIONS} value={repeat} onChange={setRepeat} tone="plan" />
        {repeat !== "1" && (
          <span className="text-[12px] text-(--color-text-muted)">
            Lægges på {repeat} {weekdayName.toLowerCase()}e frem. Hver dag kan ændres for sig
            bagefter.
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          tone="plan"
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
