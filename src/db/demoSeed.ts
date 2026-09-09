import { generateId } from "../lib/id";
import type { CardioEntry, Exercise, PlannedWorkout, Routine, SetEntry, WorkoutSession } from "../types";
import { toISODate } from "../lib/date";
import { getDb } from "./database";
import { listExercises } from "./exercises";

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SPLITS: Record<string, string[]> = {
  "Push Dag": [
    "Flad bænkpres med vægtstang",
    "Skrå bænkpres med håndvægte",
    "Military press",
    "Triceps pushdown",
  ],
  "Pull Dag": [
    "Dødløft",
    "Kropshævninger",
    "Siddende cable-roning",
    "Biceps curl med vægtstang",
  ],
  "Ben Dag": ["Squat med vægtstang", "Benpres", "Rumænsk dødløft", "Stående tåhæv"],
};

const BASE_WEIGHT: Record<string, number> = {
  "Flad bænkpres med vægtstang": 40,
  "Skrå bænkpres med håndvægte": 14,
  "Military press": 25,
  "Triceps pushdown": 20,
  Dødløft: 60,
  Kropshævninger: 0,
  "Siddende cable-roning": 35,
  "Biceps curl med vægtstang": 20,
  "Squat med vægtstang": 50,
  Benpres: 80,
  "Rumænsk dødløft": 40,
  "Stående tåhæv": 40,
};

const WEEKS = 52;

/**
 * Genererer ca. et års realistisk brugshistorik (træninger, cardio,
 * kropsvægt, rutiner, planlagte dage) direkte i den lokale IndexedDB via
 * de rigtige db-funktioner/typer. Bruges kun som en engangs "prøv appen
 * som om du havde brugt den længe"-handling.
 */
export async function generateDemoHistory(): Promise<{
  sessionCount: number;
  setCount: number;
  cardioCount: number;
  weightCount: number;
}> {
  const db = await getDb();
  const allExercises = await listExercises();
  const byName = new Map(allExercises.map((e) => [e.name, e]));

  const routineIds: Record<string, string> = {};
  for (const [name, exerciseNames] of Object.entries(SPLITS)) {
    const exerciseIds = exerciseNames
      .map((n) => byName.get(n)?.id)
      .filter((id): id is string => Boolean(id));
    const routine: Routine = {
      id: generateId(),
      name,
      exerciseIds,
      createdAt: new Date().toISOString(),
    };
    const tx = db.transaction("routines", "readwrite");
    await tx.store.add(routine);
    await tx.done;
    routineIds[name] = routine.id;
  }

  const today = new Date();
  today.setHours(18, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - WEEKS * 7);

  const splitOrder = Object.keys(SPLITS);
  const bestByExercise = new Map<string, { weight: number; reps: number; date: string }>();

  let sessionCount = 0;
  let setCount = 0;

  for (let week = 0; week < WEEKS; week++) {
    const dayOffsets = [1, 3, 5];
    for (const dayOffset of dayOffsets) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + week * 7 + dayOffset);
      if (sessionDate > today) continue;

      const splitName = splitOrder[(week * 3 + dayOffsets.indexOf(dayOffset)) % splitOrder.length];
      const exerciseNames = SPLITS[splitName];

      const startedAt = new Date(sessionDate);
      startedAt.setHours(17, Math.floor(rand(0, 59)), 0, 0);
      const durationMin = Math.round(rand(45, 75));
      const endedAt = new Date(startedAt.getTime() + durationMin * 60000);

      const session: WorkoutSession = {
        id: generateId(),
        date: toISODate(sessionDate),
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMin,
      };
      const sessionTx = db.transaction("workoutSessions", "readwrite");
      await sessionTx.store.add(session);
      await sessionTx.done;
      sessionCount++;

      for (const exName of exerciseNames) {
        const exercise = byName.get(exName);
        if (!exercise) continue;

        const baseWeight = BASE_WEIGHT[exName] ?? 20;
        const progressed = baseWeight * (1 + week * 0.011);
        const setsThisExercise = Math.round(rand(3, 4));

        for (let setIndex = 0; setIndex < setsThisExercise; setIndex++) {
          const isWarmup = setIndex === 0 && Math.random() < 0.4;
          const weight =
            Math.round((isWarmup ? progressed * 0.6 : progressed + rand(-2, 2)) * 2) / 2;
          const reps = isWarmup ? 10 : Math.round(rand(5, 10));

          const set: SetEntry = {
            id: generateId(),
            sessionId: session.id,
            exerciseId: exercise.id,
            weight: Math.max(0, weight),
            reps,
            setType: isWarmup ? "warmup" : "normal",
            order: setIndex,
            createdAt: new Date(startedAt.getTime() + setIndex * 4 * 60000).toISOString(),
          };
          const setTx = db.transaction("sets", "readwrite");
          await setTx.store.add(set);
          await setTx.done;
          setCount++;

          if (set.setType !== "warmup") {
            const current = bestByExercise.get(exercise.id);
            if (
              !current ||
              set.weight > current.weight ||
              (set.weight === current.weight && set.reps > current.reps)
            ) {
              bestByExercise.set(exercise.id, {
                weight: set.weight,
                reps: set.reps,
                date: set.createdAt,
              });
            }
          }
        }
      }
    }
  }

  for (const [exerciseId, best] of bestByExercise.entries()) {
    const exercise = allExercises.find((e) => e.id === exerciseId) as Exercise | undefined;
    if (!exercise) continue;
    const exTx = db.transaction("exercises", "readwrite");
    await exTx.store.put({
      ...exercise,
      prWeight: best.weight,
      prReps: best.reps,
      prDate: best.date,
    });
    await exTx.done;
  }

  let cardioCount = 0;
  for (let week = 0; week < WEEKS; week++) {
    const runsThisWeek = Math.random() < 0.5 ? 1 : 2;
    for (let i = 0; i < runsThisWeek; i++) {
      const runDate = new Date(startDate);
      runDate.setDate(runDate.getDate() + week * 7 + pick([0, 2, 6]));
      if (runDate > today) continue;

      const distanceKm = Math.round(rand(3, 8) * 10) / 10;
      const durationMin = Math.round(distanceKm * rand(5, 6.5));

      const entry: CardioEntry = {
        id: generateId(),
        date: toISODate(runDate),
        activity: "Løb",
        distanceKm,
        durationMin,
      };
      const cTx = db.transaction("cardioEntries", "readwrite");
      await cTx.store.add(entry);
      await cTx.done;
      cardioCount++;
    }
  }

  let weightCount = 0;
  const weightStart = 85;
  const weightEnd = 78;
  for (let week = 0; week < WEEKS; week++) {
    const logsThisWeek = Math.round(rand(2, 3));
    for (let i = 0; i < logsThisWeek; i++) {
      const logDate = new Date(startDate);
      logDate.setDate(logDate.getDate() + week * 7 + Math.floor(rand(0, 6)));
      if (logDate > today) continue;

      const progress = week / WEEKS;
      const trendWeight = weightStart + (weightEnd - weightStart) * progress;
      const weight = Math.round((trendWeight + rand(-0.6, 0.6)) * 10) / 10;

      const entry = { id: generateId(), date: toISODate(logDate), weight };
      const wTx = db.transaction("bodyweightEntries", "readwrite");
      await wTx.store.add(entry);
      await wTx.done;
      weightCount++;
    }
  }

  const plannedTx = db.transaction("plannedWorkouts", "readwrite");
  for (const [dayOffset, splitName] of [
    [1, "Push Dag"],
    [3, "Pull Dag"],
  ] as const) {
    const planDate = new Date(today);
    planDate.setDate(planDate.getDate() + dayOffset);
    const exerciseIds = SPLITS[splitName]
      .map((n) => byName.get(n)?.id)
      .filter((id): id is string => Boolean(id));
    const plan: PlannedWorkout = {
      id: generateId(),
      date: toISODate(planDate),
      routineId: routineIds[splitName],
      exerciseIds,
    };
    await plannedTx.store.add(plan);
  }
  await plannedTx.done;

  return { sessionCount, setCount, cardioCount, weightCount };
}
