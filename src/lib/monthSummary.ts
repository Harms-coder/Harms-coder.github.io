import { parseISODate } from "./date";
import type { Exercise, SetEntry, WorkoutSession } from "../types";

export interface MonthSummary {
  /** "2026-09" */
  monthKey: string;
  sessionCount: number;
  kgLifted: number;
  setCount: number;
  /** Rekorder der stadig står, sat i denne måned (både tungeste sæt og 1RM). */
  prCount: number;
  /** Længste række træningsdage i måneden, samme regel som streaken andre steder (højst 2 dages hul). */
  longestStreak: number;
  topExercise?: { name: string; sets: number };
}

const MAX_STREAK_GAP_DAYS = 2;

/** Længste række af træningsdage, hvor der højst er to dage imellem. */
function longestRun(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  if (sorted.length === 0) return 0;
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gapDays = Math.round(
      (parseISODate(sorted[i]).getTime() - parseISODate(sorted[i - 1]).getTime()) / 86_400_000,
    );
    current = gapDays <= MAX_STREAK_GAP_DAYS ? current + 1 : 1;
    if (current > best) best = current;
  }
  return best;
}

function inMonth(isoDate: string | undefined, monthKey: string): boolean {
  return isoDate !== undefined && isoDate.slice(0, 7) === monthKey;
}

export function buildMonthSummary(input: {
  monthKey: string;
  sessions: WorkoutSession[];
  setsBySession: Map<string, SetEntry[]>;
  exercises: Exercise[];
}): MonthSummary {
  const { monthKey, sessions, setsBySession, exercises } = input;
  const monthSessions = sessions.filter((s) => s.endedAt && inMonth(s.date, monthKey));

  let kgLifted = 0;
  let setCount = 0;
  const setsPerExercise = new Map<string, number>();

  for (const session of monthSessions) {
    for (const set of setsBySession.get(session.id) ?? []) {
      if (set.setType === "warmup") continue;
      kgLifted += set.weight * set.reps;
      setCount += 1;
      setsPerExercise.set(set.exerciseId, (setsPerExercise.get(set.exerciseId) ?? 0) + 1);
    }
  }

  const prCount = exercises.reduce(
    (sum, e) =>
      sum +
      (inMonth(e.prDate?.slice(0, 10), monthKey) ? 1 : 0) +
      (inMonth(e.pr1RMDate?.slice(0, 10), monthKey) ? 1 : 0),
    0,
  );

  const top = [...setsPerExercise.entries()].sort((a, b) => b[1] - a[1])[0];
  const topName = top ? exercises.find((e) => e.id === top[0])?.name : undefined;

  return {
    monthKey,
    sessionCount: monthSessions.length,
    kgLifted,
    setCount,
    prCount,
    longestStreak: longestRun(monthSessions.map((s) => s.date)),
    topExercise: top && topName ? { name: topName, sets: top[1] } : undefined,
  };
}
