import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { listExercises } from "../../db/exercises";
import { deleteSession, endSession, getActiveSession, startSession } from "../../db/sessions";
import { deleteSet, getLastSetForExercise, listSetsForSession } from "../../db/sets";
import type { Exercise, SetEntry, SetType, WorkoutSession } from "../../types";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseSessionCard } from "./ExerciseSessionCard";
import { orderFromSets } from "./exerciseOrder";
import { logSet } from "./logSet";

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

  async function handleCancel() {
    if (!session) return;
    if (!window.confirm("Annuller denne træning? Den tæller så ikke som en træning, og logget sæt slettes.")) {
      return;
    }
    await Promise.all(sets.map((set) => deleteSet(set.id)));
    await deleteSession(session.id);
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
    const { newSet, updatedExercise } = await logSet({
      sessionId: session.id,
      exerciseId,
      weight: values.weight,
      reps: values.reps,
      setType: values.setType,
      order: existingForExercise.length,
    });
    setSets((current) => [...current, newSet]);
    if (updatedExercise) {
      setExercises((current) =>
        current.map((exercise) => (exercise.id === exerciseId ? updatedExercise : exercise)),
      );
    }
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
      <div className="flex flex-col items-center gap-4 px-4 pt-6 text-center">
        <PageBackdrop image="/images/traening-gym.jpg" imagePosition="center 55%" />
        <h1 className="mt-8 text-2xl font-semibold text-(--color-text)">Træning</h1>
        <p className="text-sm text-(--color-text-muted)">
          Start en træning for at begynde at logge sæt.
        </p>
        <Button onClick={handleStart}>Start træning</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/traening-gym.jpg" imagePosition="center 55%" />
      <button
        type="button"
        onClick={handleCancel}
        className="self-start text-[13px] font-medium text-(--color-text-muted) active:opacity-70"
      >
        Annuller træning
      </button>
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

      <Link
        to="/traening/live"
        className="rounded-2xl border border-(--color-border-accent) bg-(--color-surface-2) px-4 py-3 text-center text-[14px] font-medium text-(--color-accent-bright) active:opacity-80"
      >
        Skift til live-tilstand →
      </Link>

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
