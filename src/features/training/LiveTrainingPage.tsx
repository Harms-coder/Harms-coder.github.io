import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { ExercisePhotoThumb } from "../exercises/ExercisePhotoThumb";
import {
  IconChevronLeft,
  IconChevronRight,
  IconPause,
  IconPlay,
  IconTrophy,
  IconX,
} from "../../components/icons";
import { getPlannedWorkoutForDate } from "../../db/plannedWorkouts";
import { listExercises } from "../../db/exercises";
import { deleteSession, endSession, getActiveSession } from "../../db/sessions";
import { deleteSet, listSetsForExercise, listSetsForSession } from "../../db/sets";
import { formatMediumDate, parseISODate } from "../../lib/date";
import type { Exercise, SetEntry, SetType, WorkoutSession } from "../../types";
import { ExercisePicker } from "./ExercisePicker";
import { RestTimer } from "./RestTimer";
import { SetInputForm } from "./SetInputForm";
import { orderFromSets } from "./exerciseOrder";
import { logSet } from "./logSet";

const SUGGESTED_WEIGHT_STEP = 2.5;

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function LiveTrainingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [priorSets, setPriorSets] = useState<Record<string, SetEntry | undefined>>({});
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [restAutoSignal, setRestAutoSignal] = useState(0);

  const [nowTick, setNowTick] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [pausedMs, setPausedMs] = useState(0);
  const [pauseStartedAt, setPauseStartedAt] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const [activeSession, allExercises] = await Promise.all([getActiveSession(), listExercises()]);
      setExercises(allExercises);

      if (!activeSession) {
        setLoading(false);
        return;
      }
      setSession(activeSession);

      const [plan, sessionSets] = await Promise.all([
        getPlannedWorkoutForDate(activeSession.date),
        listSetsForSession(activeSession.id),
      ]);
      setSets(sessionSets);

      const planOrder = plan?.exerciseIds ?? [];
      const extraOrder = orderFromSets(sessionSets).filter((id) => !planOrder.includes(id));
      const order = [...planOrder, ...extraOrder];
      setExerciseOrder(order);

      const lastLoggedExerciseId = sessionSets[sessionSets.length - 1]?.exerciseId;
      const resumeIndex = lastLoggedExerciseId ? order.indexOf(lastLoggedExerciseId) : -1;
      setCurrentIndex(resumeIndex >= 0 ? resumeIndex : 0);

      setLoading(false);
    }
    void load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const currentExerciseId = exerciseOrder[currentIndex];

  useEffect(() => {
    if (!currentExerciseId || !session || currentExerciseId in priorSets) return;
    void listSetsForExercise(currentExerciseId).then((allSets) => {
      const prior = [...allSets].reverse().find((s) => s.sessionId !== session.id);
      setPriorSets((current) => ({ ...current, [currentExerciseId]: prior }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseId, session]);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const currentExercise = currentExerciseId ? exerciseById.get(currentExerciseId) : undefined;
  const setsForCurrent = useMemo(
    () => sets.filter((s) => s.exerciseId === currentExerciseId),
    [sets, currentExerciseId],
  );
  const priorSet = currentExerciseId ? priorSets[currentExerciseId] : undefined;
  const lastInSession = setsForCurrent[setsForCurrent.length - 1];
  const suggestedWeight = priorSet ? priorSet.weight + SUGGESTED_WEIGHT_STEP : undefined;

  function togglePause() {
    if (isPaused) {
      if (pauseStartedAt) setPausedMs((current) => current + (Date.now() - pauseStartedAt));
      setPauseStartedAt(null);
      setIsPaused(false);
    } else {
      setPauseStartedAt(Date.now());
      setIsPaused(true);
    }
  }

  const elapsedMs = session
    ? (isPaused && pauseStartedAt ? pauseStartedAt : nowTick) -
      new Date(session.startedAt).getTime() -
      pausedMs
    : 0;

  async function handleAddSet(values: { weight: number; reps: number; setType: SetType }) {
    if (!session || !currentExerciseId) return;
    const { newSet, updatedExercise } = await logSet({
      sessionId: session.id,
      exerciseId: currentExerciseId,
      weight: values.weight,
      reps: values.reps,
      setType: values.setType,
      order: setsForCurrent.length,
    });
    setSets((current) => [...current, newSet]);
    if (updatedExercise) {
      setExercises((current) =>
        current.map((exercise) => (exercise.id === currentExerciseId ? updatedExercise : exercise)),
      );
    }
    setRestAutoSignal((t) => t + 1);
  }

  function handleSelectExercise(exercise: Exercise) {
    setShowExercisePicker(false);
    const existingIndex = exerciseOrder.indexOf(exercise.id);
    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
      return;
    }
    setCurrentIndex(exerciseOrder.length);
    setExerciseOrder((order) => [...order, exercise.id]);
  }

  async function handleEnd() {
    if (!session) return;
    if (!window.confirm("Afslut træningen?")) return;
    await endSession(session.id);
    navigate("/");
  }

  async function handleCancel() {
    if (!session) return;
    if (!window.confirm("Annuller denne træning? Den tæller så ikke som en træning, og logget sæt slettes.")) {
      return;
    }
    await Promise.all(sets.map((set) => deleteSet(set.id)));
    await deleteSession(session.id);
    navigate("/");
  }

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
        <p className="text-sm text-(--color-text-muted)">Ingen aktiv træning.</p>
        <Link
          to="/traening"
          className="flex items-center gap-1 text-(--color-cat-strength)"
        >
          Gå til Træning
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col gap-4 px-4 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <Link
          to="/traening"
          aria-label="Luk live-tilstand"
          className="flex h-9 w-9 items-center justify-center rounded-full glass-fill text-(--color-text-muted) active:opacity-70"
        >
          <IconX className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? "Genoptag træning" : "Pause træning"}
          className="flex items-center gap-2 rounded-full glass-fill px-4 py-2 text-[18px] font-semibold tabular-nums text-(--color-text)"
        >
          {isPaused ? (
            <IconPlay className="h-4 w-4 text-(--color-cat-strength)" />
          ) : (
            <IconPause className="h-4 w-4 text-(--color-text-muted)" />
          )}
          {formatElapsed(elapsedMs)}
        </button>
        <Button variant="danger" onClick={handleEnd} className="px-3 text-[13px]">
          Afslut
        </Button>
      </div>

      <button
        type="button"
        onClick={handleCancel}
        className="self-end text-[13px] font-medium text-(--color-text-muted) active:opacity-70"
      >
        Annuller træning
      </button>

      {currentExercise ? (
        <>
          <div className="hero-glow flex min-h-32 items-stretch overflow-hidden rounded-2xl border border-(--color-border-accent) card-shadow">
            {/* Samme flade billedfelt som øvelseslisten, så man kan se stillingen mens man træner. */}
            <ExercisePhotoThumb exercise={currentExercise} width={124} />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
              <span className="text-[13px] font-medium text-(--color-cat-strength)">
                Øvelse {currentIndex + 1} af {exerciseOrder.length}
                {currentExercise.category ? ` · ${currentExercise.category}` : ""}
              </span>
              <span className="text-[22px] font-bold leading-tight text-(--color-text)">
                {currentExercise.name}
              </span>
              <span className="text-[13px] text-(--color-text-muted)">
                {setsForCurrent.length === 0
                  ? "Ingen sæt endnu i denne træning"
                  : `${setsForCurrent.length} sæt logget`}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Seneste præstation
            </span>
            {priorSet ? (
              <>
                <span className="text-[17px] font-semibold text-(--color-text)">
                  Sidst: {priorSet.weight} kg × {priorSet.reps}
                </span>
                <span className="text-[12px] text-(--color-text-muted)">
                  {formatMediumDate(parseISODate(priorSet.createdAt.slice(0, 10)))}
                  {suggestedWeight !== undefined && ` · prøv ${suggestedWeight} kg næste gang`}
                </span>
              </>
            ) : (
              <span className="text-[13px] text-(--color-text-muted)">
                Ingen tidligere sæt for denne øvelse endnu.
              </span>
            )}
          </div>

          {setsForCurrent.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {setsForCurrent.map((set, index) => {
                const isPr =
                  currentExercise.prWeight === set.weight &&
                  currentExercise.prReps === set.reps &&
                  set.setType !== "warmup" &&
                  set.setType !== "dropset";
                return (
                  <div
                    key={set.id}
                    className="flex items-center gap-2 text-[14px] text-(--color-text)"
                  >
                    Sæt {index + 1}: {set.weight} kg × {set.reps}
                    {isPr && (
                      <span className="flex items-center gap-1 text-[12px] font-medium text-(--color-cat-strength)">
                        <IconTrophy className="h-3.5 w-3.5" />
                        PR
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <SetInputForm
            key={`${currentExerciseId}-${priorSet ? "seeded" : "empty"}`}
            initialWeight={lastInSession?.weight ?? priorSet?.weight}
            initialReps={lastInSession?.reps ?? priorSet?.reps}
            onSave={handleAddSet}
          />

          <RestTimer autoStartSignal={restAutoSignal} />

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
              className="flex flex-1 items-center justify-center gap-1"
            >
              <IconChevronLeft className="h-4 w-4" />
              Forrige
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((i) => i + 1)}
              disabled={currentIndex >= exerciseOrder.length - 1}
              className="flex flex-1 items-center justify-center gap-1"
            >
              Næste
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="text-sm text-(--color-text-muted)">
          Vælg din første øvelse for at komme i gang.
        </p>
      )}

      {showExercisePicker ? (
        <ExercisePicker
          exercises={exercises.filter((e) => !exerciseOrder.includes(e.id))}
          onSelect={handleSelectExercise}
          onClose={() => setShowExercisePicker(false)}
        />
      ) : (
        <Button variant="ghost" onClick={() => setShowExercisePicker(true)}>
          + Tilføj øvelse
        </Button>
      )}
    </div>
  );
}
