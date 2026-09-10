import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { listExercises } from "../../db/exercises";
import { listGoals } from "../../db/goals";
import { getPlannedWorkoutForDate, listPlannedWorkoutsInRange } from "../../db/plannedWorkouts";
import { listRoutines } from "../../db/routines";
import { deleteSession, endSession, getActiveSession, listSessions, startSession } from "../../db/sessions";
import { deleteSet, getLastSetForExercise, listSetsForSession } from "../../db/sets";
import { formatShortDate, getCurrentWeekRange, parseISODate, toISODate, todayISODate } from "../../lib/date";
import { computeSessionStreak } from "../../lib/progressBadges";
import type { Exercise, SetEntry, SetType, WorkoutSession } from "../../types";
import { ExercisePicker } from "./ExercisePicker";
import { ExerciseSessionCard } from "./ExerciseSessionCard";
import { TrainingIdleView } from "./TrainingIdleView";
import { orderFromSets } from "./exerciseOrder";
import { logSet } from "./logSet";

const UPCOMING_PLAN_WINDOW_DAYS = 13;

interface IdlePlanInfo {
  title: string;
  exerciseCount: number;
  categoryCount: number;
  categoriesLine?: string;
}

interface IdleLastSessionInfo {
  title: string;
  durationMin?: number;
  setCount: number;
  dateLabel: string;
}

interface IdleData {
  completedToday: boolean;
  plan?: IdlePlanInfo;
  nextPlanDate?: string;
  lastSession?: IdleLastSessionInfo;
  weekSessionCount: number;
  streakDays: number;
  goalRemaining?: number;
}

function joinDanish(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  const lowered = items.map((item, i) => (i === 0 ? item : item.toLowerCase()));
  return `${lowered.slice(0, -1).join(", ")} og ${lowered[lowered.length - 1]}`;
}

function relativeDayLabel(dateISO: string, today: string): string {
  if (dateISO === today) return "i dag";
  const yesterday = toISODate(new Date(parseISODate(today).getTime() - 86_400_000));
  if (dateISO === yesterday) return "i går";
  return formatShortDate(dateISO);
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
  const [idleData, setIdleData] = useState<IdleData | null>(null);

  async function loadIdleDashboard(allExercises: Exercise[]) {
    const exerciseById = new Map(allExercises.map((e) => [e.id, e]));
    const today = todayISODate();
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();

    const [plannedWorkout, routines, allSessions, goals] = await Promise.all([
      getPlannedWorkoutForDate(today),
      listRoutines(),
      listSessions(),
      listGoals(),
    ]);

    const completedToday = allSessions.some((s) => s.endedAt && s.date === today);
    const weekSessionCount = allSessions.filter(
      (s) => s.endedAt && s.date >= weekStart && s.date <= weekEnd,
    ).length;
    const streakDays = computeSessionStreak(allSessions);
    const sessionsGoal = goals.find((g) => g.type === "sessionsPerWeek");
    const goalRemaining = sessionsGoal ? Math.max(0, sessionsGoal.target - weekSessionCount) : undefined;

    let plan: IdlePlanInfo | undefined;
    let nextPlanDate: string | undefined;
    if (plannedWorkout) {
      const planExercises = plannedWorkout.exerciseIds
        .map((id) => exerciseById.get(id))
        .filter((e): e is Exercise => Boolean(e));
      const categories = [...new Set(planExercises.map((e) => e.category).filter((c): c is string => Boolean(c)))];
      const routine = plannedWorkout.routineId
        ? routines.find((r) => r.id === plannedWorkout.routineId)
        : undefined;
      plan = {
        title: routine?.name ?? "Din træning i dag",
        exerciseCount: planExercises.length,
        categoryCount: categories.length,
        categoriesLine: routine?.name && categories.length > 0 ? joinDanish(categories) : undefined,
      };
    } else {
      const windowEnd = new Date();
      windowEnd.setDate(windowEnd.getDate() + UPCOMING_PLAN_WINDOW_DAYS);
      const upcoming = await listPlannedWorkoutsInRange(today, toISODate(windowEnd));
      nextPlanDate = upcoming
        .filter((p) => p.date > today)
        .sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
    }

    const lastCompleted = allSessions.find((s) => s.endedAt);
    let lastSession: IdleLastSessionInfo | undefined;
    if (lastCompleted) {
      const lastSets = await listSetsForSession(lastCompleted.id);
      const categories = [
        ...new Set(
          lastSets
            .map((s) => exerciseById.get(s.exerciseId)?.category)
            .filter((c): c is string => Boolean(c)),
        ),
      ];
      lastSession = {
        title: categories.length > 0 ? joinDanish(categories) : "Træning",
        durationMin: lastCompleted.durationMin,
        setCount: lastSets.length,
        dateLabel: relativeDayLabel(lastCompleted.date, today),
      };
    }

    setIdleData({ completedToday, plan, nextPlanDate, lastSession, weekSessionCount, streakDays, goalRemaining });
  }

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
    } else {
      await loadIdleDashboard(allExercises);
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
    await loadIdleDashboard(exercises);
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
    await loadIdleDashboard(exercises);
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
    if (!idleData) return null;
    return (
      <TrainingIdleView
        onStart={handleStart}
        completedToday={idleData.completedToday}
        plan={idleData.plan}
        nextPlanDate={idleData.nextPlanDate}
        lastSession={idleData.lastSession}
        weekSessionCount={idleData.weekSessionCount}
        streakDays={idleData.streakDays}
        goalRemaining={idleData.goalRemaining}
      />
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
          <h1 className="text-2xl font-bold text-(--color-text)">Træning</h1>
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
