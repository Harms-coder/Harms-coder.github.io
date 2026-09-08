import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { listExercises } from "../../db/exercises";
import { endSession, getActiveSession, startSession } from "../../db/sessions";
import { addSet, deleteSet, getLastSetForExercise, listSetsForSession } from "../../db/sets";
import type { Exercise, SetEntry, SetType, WorkoutSession } from "../../types";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseSessionCard } from "./ExerciseSessionCard";

function orderFromSets(sessionSets: SetEntry[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const set of [...sessionSets].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (!seen.has(set.exerciseId)) {
      seen.add(set.exerciseId);
      order.push(set.exerciseId);
    }
  }
  return order;
}

export function TrainingPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [seeds, setSeeds] = useState<Record<string, { weight: number; reps: number } | undefined>>(
    {},
  );

  async function loadActiveSession() {
    const [allExercises, activeSession] = await Promise.all([
      listExercises(),
      getActiveSession(),
    ]);
    const sessionSets = activeSession ? await listSetsForSession(activeSession.id) : [];

    setExercises(allExercises);
    if (activeSession) {
      setSession(activeSession);
      setSets(sessionSets);
      setExerciseOrder(orderFromSets(sessionSets));
    }
    setLoading(false);
  }

  useEffect(() => {
    void loadActiveSession();
  }, []);

  async function handleStart() {
    const newSession = await startSession();
    setSession(newSession);
    setSets([]);
    setExerciseOrder([]);
    setSeeds({});
  }

  async function handleEnd() {
    if (!session) return;
    if (!window.confirm("Afslut træningen?")) return;
    await endSession(session.id);
    setSession(null);
    setSets([]);
    setExerciseOrder([]);
    setExpandedExerciseId(null);
  }

  async function handleSelectExercise(exercise: Exercise) {
    setShowPicker(false);
    setExpandedExerciseId(exercise.id);
    setExerciseOrder((order) => (order.includes(exercise.id) ? order : [...order, exercise.id]));
    if (!(exercise.id in seeds)) {
      const last = await getLastSetForExercise(exercise.id);
      setSeeds((current) => ({
        ...current,
        [exercise.id]: last ? { weight: last.weight, reps: last.reps } : undefined,
      }));
    }
  }

  async function handleAddSet(
    exerciseId: string,
    values: { weight: number; reps: number; setType: SetType },
  ) {
    if (!session) return;
    const existingForExercise = sets.filter((s) => s.exerciseId === exerciseId);
    const newSet = await addSet({
      sessionId: session.id,
      exerciseId,
      weight: values.weight,
      reps: values.reps,
      setType: values.setType,
      order: existingForExercise.length,
    });
    setSets((current) => [...current, newSet]);
  }

  async function handleDeleteSet(setId: string) {
    await deleteSet(setId);
    setSets((current) => current.filter((s) => s.id !== setId));
  }

  const exerciseById = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const exercise of exercises) map.set(exercise.id, exercise);
    return map;
  }, [exercises]);

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pt-16 text-center">
        <h1 className="text-2xl font-semibold text-(--color-text)">Træning</h1>
        <p className="text-sm text-(--color-text-muted)">
          Start en træning for at begynde at logge sæt.
        </p>
        <Button onClick={handleStart}>Start træning</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-(--color-text)">Træning</h1>
          <span className="text-[13px] text-(--color-text-muted)">
            Startet{" "}
            {new Date(session.startedAt).toLocaleTimeString("da-DK", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <Button variant="danger" onClick={handleEnd}>
          Afslut
        </Button>
      </div>

      {exerciseOrder.map((exerciseId) => {
        const exercise = exerciseById.get(exerciseId);
        if (!exercise) return null;
        const setsForExercise = sets.filter((s) => s.exerciseId === exerciseId);
        const lastInSession = setsForExercise[setsForExercise.length - 1];
        const seed = seeds[exerciseId];
        return (
          <ExerciseSessionCard
            key={exerciseId}
            exercise={exercise}
            sets={setsForExercise}
            expanded={expandedExerciseId === exerciseId}
            initialWeight={lastInSession?.weight ?? seed?.weight}
            initialReps={lastInSession?.reps ?? seed?.reps}
            onToggle={() =>
              setExpandedExerciseId((current) => (current === exerciseId ? null : exerciseId))
            }
            onAddSet={(values) => handleAddSet(exerciseId, values)}
            onDeleteSet={handleDeleteSet}
          />
        );
      })}

      {showPicker ? (
        <ExercisePicker
          exercises={exercises.filter((e) => !exerciseOrder.includes(e.id))}
          onSelect={handleSelectExercise}
          onClose={() => setShowPicker(false)}
        />
      ) : (
        <Button variant="secondary" onClick={() => setShowPicker(true)}>
          + Tilføj øvelse
        </Button>
      )}
    </div>
  );
}
