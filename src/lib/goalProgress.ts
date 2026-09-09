import type { BodyweightEntry, CardioEntry, Exercise, Goal, WorkoutSession } from "../types";

export interface GoalProgress {
  goal: Goal;
  current: number;
  target: number;
  percent: number;
  label: string;
  statusText: string;
  achieved: boolean;
}

export interface GoalProgressContext {
  /** Afsluttede sessions i den løbende uge. */
  sessionsThisWeek: WorkoutSession[];
  cardioThisWeek: CardioEntry[];
  latestBodyweight?: BodyweightEntry;
  exerciseById: Map<string, Exercise>;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function towardTarget(goal: Goal, target: number, current: number, label: string, statusText: string): GoalProgress {
  const percent = target > 0 ? clamp((current / target) * 100, 0, 100) : 0;
  return { goal, current, target, percent, label, statusText, achieved: target > 0 && current >= target };
}

export function computeGoalProgress(goal: Goal, ctx: GoalProgressContext): GoalProgress {
  switch (goal.type) {
    case "sessionsPerWeek": {
      const current = ctx.sessionsThisWeek.length;
      return towardTarget(
        goal,
        goal.target,
        current,
        "Træninger pr. uge",
        `${current}/${goal.target} træninger`,
      );
    }
    case "distanceKmPerWeek": {
      const current = round1(ctx.cardioThisWeek.reduce((sum, c) => sum + c.distanceKm, 0));
      return towardTarget(
        goal,
        goal.target,
        current,
        "Km pr. uge",
        `${current} / ${goal.target} km`,
      );
    }
    case "bodyweight": {
      const current = ctx.latestBodyweight?.weight ?? goal.startValue ?? 0;
      const percent =
        goal.startValue === undefined || goal.startValue === goal.target
          ? current === goal.target
            ? 100
            : 0
          : clamp(((current - goal.startValue) / (goal.target - goal.startValue)) * 100, 0, 100);
      return {
        goal,
        current,
        target: goal.target,
        percent,
        label: "Mål-kropsvægt",
        statusText: `${current} kg / mål ${goal.target} kg`,
        achieved: percent >= 100,
      };
    }
    case "exerciseWeight": {
      const exercise = goal.exerciseId ? ctx.exerciseById.get(goal.exerciseId) : undefined;
      const current = exercise?.prWeight ?? 0;
      return towardTarget(
        goal,
        goal.target,
        current,
        exercise ? `${exercise.name} · tungeste sæt` : "Styrkemål",
        `${current} / ${goal.target} kg`,
      );
    }
    case "exercise1RM": {
      const exercise = goal.exerciseId ? ctx.exerciseById.get(goal.exerciseId) : undefined;
      const current = exercise?.pr1RM ? Math.round(exercise.pr1RM) : 0;
      return towardTarget(
        goal,
        goal.target,
        current,
        exercise ? `${exercise.name} · 1RM` : "Styrkemål",
        `${current} / ${goal.target} kg`,
      );
    }
  }
}
