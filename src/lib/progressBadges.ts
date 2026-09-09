import { parseISODate, todayISODate } from "./date";
import type { Exercise, SetEntry, WorkoutSession } from "../types";
import type { GoalProgress } from "./goalProgress";

export type BadgeKind = "pr" | "oneRm" | "gain" | "streak" | "bestMonth" | "goal";

export interface Badge {
  kind: BadgeKind;
  label: string;
}

const RECENT_PR_DAYS = 7;
const RECENT_GAIN_DAYS = 30;
const RECENT_GAIN_THRESHOLD_KG = 2.5;
const MIN_STREAK_TO_SHOW = 2;

function recentlyBeaten(date: string | undefined, days: number): boolean {
  if (!date) return false;
  return new Date(date).getTime() >= Date.now() - days * 86_400_000;
}

function biggestRecentGain(
  exercises: Exercise[],
  setsByExercise: Map<string, SetEntry[]>,
  days: number,
): { exerciseName: string; deltaKg: number } | undefined {
  const cutoffIso = new Date(Date.now() - days * 86_400_000).toISOString();
  let best: { exerciseName: string; deltaKg: number } | undefined;

  for (const exercise of exercises) {
    const sets = (setsByExercise.get(exercise.id) ?? [])
      .filter((s) => s.setType !== "warmup")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sets.length === 0) continue;

    const beforeCutoff = [...sets].reverse().find((s) => s.createdAt <= cutoffIso);
    const baselineWeight = beforeCutoff?.weight ?? sets[0].weight;
    const currentWeight = exercise.prWeight ?? sets[sets.length - 1].weight;
    const deltaKg = Math.round((currentWeight - baselineWeight) * 10) / 10;

    if (deltaKg >= RECENT_GAIN_THRESHOLD_KG && (!best || deltaKg > best.deltaKg)) {
      best = { exerciseName: exercise.name, deltaKg };
    }
  }
  return best;
}

function computeSessionStreak(sessions: WorkoutSession[]): number {
  const dates = [...new Set(sessions.filter((s) => s.endedAt).map((s) => s.date))]
    .sort()
    .reverse();
  if (dates.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const gapDays = Math.round(
      (parseISODate(dates[i]).getTime() - parseISODate(dates[i + 1]).getTime()) / 86_400_000,
    );
    if (gapDays <= 2) streak++;
    else break;
  }
  return streak;
}

function isBestMonthSoFar(sessions: WorkoutSession[]): boolean {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    if (!session.endedAt) continue;
    const key = session.date.slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size < 2) return false;

  const currentKey = todayISODate().slice(0, 7);
  const currentCount = counts.get(currentKey) ?? 0;
  if (currentCount === 0) return false;

  for (const [key, count] of counts) {
    if (key !== currentKey && count > currentCount) return false;
  }
  return true;
}

export function computeBadges(input: {
  exercises: Exercise[];
  setsByExercise: Map<string, SetEntry[]>;
  sessions: WorkoutSession[];
  goalProgress: GoalProgress[];
}): Badge[] {
  const badges: Badge[] = [];

  const recentHeaviestPrs = input.exercises.filter((e) => recentlyBeaten(e.prDate, RECENT_PR_DAYS));
  if (recentHeaviestPrs.length > 0) {
    badges.push({
      kind: "pr",
      label:
        recentHeaviestPrs.length === 1
          ? `Ny PR: ${recentHeaviestPrs[0].name}`
          : `${recentHeaviestPrs.length} nye PR'er`,
    });
  }

  const recent1RMPrs = input.exercises.filter((e) => recentlyBeaten(e.pr1RMDate, RECENT_PR_DAYS));
  if (recent1RMPrs.length > 0) {
    badges.push({
      kind: "oneRm",
      label:
        recent1RMPrs.length === 1
          ? `Ny 1RM: ${recent1RMPrs[0].name}`
          : `${recent1RMPrs.length} nye 1RM-rekorder`,
    });
  }

  const gain = biggestRecentGain(input.exercises, input.setsByExercise, RECENT_GAIN_DAYS);
  if (gain) {
    badges.push({ kind: "gain", label: `+${gain.deltaKg} kg på ${gain.exerciseName} (30 dage)` });
  }

  const streak = computeSessionStreak(input.sessions);
  if (streak >= MIN_STREAK_TO_SHOW) {
    badges.push({ kind: "streak", label: `${streak} træninger i træk` });
  }

  if (isBestMonthSoFar(input.sessions)) {
    badges.push({ kind: "bestMonth", label: "Bedste måned indtil videre" });
  }

  const achievedGoals = input.goalProgress.filter((g) => g.achieved);
  if (achievedGoals.length > 0) {
    badges.push({
      kind: "goal",
      label: achievedGoals.length === 1 ? "Mål nået" : `${achievedGoals.length} mål nået`,
    });
  }

  return badges;
}
