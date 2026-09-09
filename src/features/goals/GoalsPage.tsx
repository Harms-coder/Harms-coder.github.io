import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { GoalTypePicker } from "../../components/GoalTypePicker";
import { PageBackdrop } from "../../components/PageBackdrop";
import { TextField } from "../../components/TextField";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { createGoal, deleteGoal, listGoals, updateGoal } from "../../db/goals";
import { listSessionsInRange } from "../../db/sessions";
import { computeGoalProgress } from "../../lib/goalProgress";
import { getCurrentWeekRange } from "../../lib/date";
import type { BodyweightEntry, CardioEntry, Exercise, Goal, GoalType, WorkoutSession } from "../../types";
import { ExercisePicker } from "../training/ExercisePicker";
import { GoalCard } from "./GoalCard";

const EXERCISE_GOAL_TYPES: GoalType[] = ["exerciseWeight", "exercise1RM"];

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weekSessions, setWeekSessions] = useState<WorkoutSession[]>([]);
  const [weekCardio, setWeekCardio] = useState<CardioEntry[]>([]);
  const [bodyweightEntries, setBodyweightEntries] = useState<BodyweightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<GoalType>("sessionsPerWeek");
  const [newTarget, setNewTarget] = useState("");
  const [newExerciseId, setNewExerciseId] = useState<string | null>(null);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  async function refresh() {
    const { start, end } = getCurrentWeekRange();
    const [allGoals, allExercises, sessions, cardio, bodyweight] = await Promise.all([
      listGoals(),
      listExercises(),
      listSessionsInRange(start, end),
      listCardioEntriesInRange(start, end),
      listBodyweightEntries(),
    ]);
    setGoals(allGoals);
    setExercises(allExercises);
    setWeekSessions(sessions.filter((s) => s.endedAt));
    setWeekCardio(cardio);
    setBodyweightEntries(bodyweight);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const progressList = useMemo(
    () =>
      goals.map((goal) =>
        computeGoalProgress(goal, {
          sessionsThisWeek: weekSessions,
          cardioThisWeek: weekCardio,
          latestBodyweight: bodyweightEntries[0],
          exerciseById,
        }),
      ),
    [goals, weekSessions, weekCardio, bodyweightEntries, exerciseById],
  );

  function resetForm() {
    setNewType("sessionsPerWeek");
    setNewTarget("");
    setNewExerciseId(null);
    setShowExercisePicker(false);
    setIsAdding(false);
  }

  async function handleAdd() {
    const target = Number(newTarget);
    if (!Number.isFinite(target) || target <= 0) return;
    if (EXERCISE_GOAL_TYPES.includes(newType) && !newExerciseId) return;

    await createGoal({
      type: newType,
      target,
      exerciseId: newExerciseId ?? undefined,
      startValue: newType === "bodyweight" ? bodyweightEntries[0]?.weight : undefined,
    });
    resetForm();
    await refresh();
  }

  async function handleUpdate(goalId: string, target: number) {
    await updateGoal(goalId, { target });
    await refresh();
  }

  async function handleDelete(goalId: string) {
    await deleteGoal(goalId);
    await refresh();
  }

  const needsExercise = EXERCISE_GOAL_TYPES.includes(newType);
  const selectedExerciseName = newExerciseId ? exerciseById.get(newExerciseId)?.name : undefined;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/mal-summit.jpg" imagePosition="center 55%" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--color-text)">Mål</h1>
        <Button
          variant={isAdding ? "secondary" : "primary"}
          onClick={() => (isAdding ? resetForm() : setIsAdding(true))}
        >
          {isAdding ? "Annuller" : "+ Nyt mål"}
        </Button>
      </div>
      <p className="text-sm text-(--color-text-muted)">
        Sæt dig konkrete mål for træning, løb, kropsvægt eller styrke, og følg fremgangen her.
      </p>

      {isAdding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <span className="text-[13px] font-medium text-(--color-text-muted)">Type</span>
          <GoalTypePicker value={newType} onChange={setNewType} />

          {needsExercise &&
            (showExercisePicker ? (
              <ExercisePicker
                exercises={exercises}
                onSelect={(exercise) => {
                  setNewExerciseId(exercise.id);
                  setShowExercisePicker(false);
                }}
                onClose={() => setShowExercisePicker(false)}
              />
            ) : (
              <Button variant="secondary" onClick={() => setShowExercisePicker(true)}>
                {selectedExerciseName ? `Øvelse: ${selectedExerciseName}` : "Vælg øvelse"}
              </Button>
            ))}

          <TextField
            label="Mål-værdi (kg, km eller antal)"
            type="number"
            inputMode="decimal"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
          />
          <Button
            onClick={handleAdd}
            disabled={!newTarget.trim() || (needsExercise && !newExerciseId)}
          >
            Gem mål
          </Button>
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && goals.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen mål endnu. Tryk "+ Nyt mål" for at oprette det første.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {progressList.map((progress) => (
          <GoalCard
            key={progress.goal.id}
            progress={progress}
            onUpdate={(target) => handleUpdate(progress.goal.id, target)}
            onDelete={() => handleDelete(progress.goal.id)}
          />
        ))}
      </div>
    </div>
  );
}
