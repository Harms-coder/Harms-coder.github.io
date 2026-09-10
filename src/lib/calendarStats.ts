import type { CardioEntry, Exercise, PlannedWorkout, WorkoutSession } from "../types";

export interface MonthStats {
  sessions: number;
  cardio: number;
  prs: number;
  /** Andel af månedens planlagte træninger der blev gennemført, 0-100. undefined hvis intet var planlagt. */
  completionPercent?: number;
}

/**
 * Tallene over kalenderen. PR'er tælles ud fra øvelsernes prDate frem for ved at gennemgå
 * alle sæt — det er samme kilde som PR-badges bruger, så tallene ikke kan komme i utakt.
 */
export function buildMonthStats(
  monthKey: string,
  sessions: WorkoutSession[],
  cardio: CardioEntry[],
  plans: PlannedWorkout[],
  exercises: Exercise[],
): MonthStats {
  const inMonth = (date: string) => date.slice(0, 7) === monthKey;

  const completedSessions = sessions.filter((s) => s.endedAt && inMonth(s.date));
  const monthPlans = plans.filter((p) => inMonth(p.date));
  const donePlans = monthPlans.filter((p) => p.status === "done");

  const prs = exercises.filter(
    (e) =>
      (e.prDate && inMonth(e.prDate.slice(0, 10))) ||
      (e.pr1RMDate && inMonth(e.pr1RMDate.slice(0, 10))),
  ).length;

  return {
    sessions: completedSessions.length,
    cardio: cardio.filter((c) => inMonth(c.date)).length,
    prs,
    completionPercent:
      monthPlans.length > 0
        ? Math.round((donePlans.length / monthPlans.length) * 100)
        : undefined,
  };
}
