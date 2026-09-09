import { generateId } from "../lib/id";
import type { Goal, GoalType } from "../types";
import { getDb } from "./database";

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  sessionsPerWeek: "Træninger pr. uge",
  distanceKmPerWeek: "Km pr. uge",
  bodyweight: "Mål-kropsvægt",
  exerciseWeight: "Styrkemål (vægt)",
  exercise1RM: "Styrkemål (1RM)",
};

export async function listGoals(): Promise<Goal[]> {
  const db = await getDb();
  const all = await db.getAll("goals");
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createGoal(input: {
  type: GoalType;
  target: number;
  exerciseId?: string;
  startValue?: number;
}): Promise<Goal> {
  const db = await getDb();
  const goal: Goal = {
    id: generateId(),
    type: input.type,
    target: input.target,
    exerciseId: input.exerciseId,
    startValue: input.startValue,
    createdAt: new Date().toISOString(),
  };
  await db.add("goals", goal);
  return goal;
}

export async function updateGoal(
  id: string,
  changes: Partial<Pick<Goal, "target" | "exerciseId" | "startValue">>,
): Promise<Goal> {
  const db = await getDb();
  const existing = await db.get("goals", id);
  if (!existing) throw new Error("Mål findes ikke");
  const updated: Goal = { ...existing, ...changes };
  await db.put("goals", updated);
  return updated;
}

export async function deleteGoal(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("goals", id);
}
