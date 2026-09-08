import { generateId } from "../lib/id";
import type { PlannedWorkout } from "../types";
import { getDb } from "./database";

export async function getPlannedWorkoutForDate(
  date: string,
): Promise<PlannedWorkout | undefined> {
  const db = await getDb();
  const all = await db.getAllFromIndex("plannedWorkouts", "by-date", date);
  return all[0];
}

export async function listPlannedWorkoutsInRange(
  startDate: string,
  endDate: string,
): Promise<PlannedWorkout[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("plannedWorkouts", "by-date");
  return all.filter((plan) => plan.date >= startDate && plan.date <= endDate);
}

export async function setPlannedWorkout(
  date: string,
  input: { routineId?: string; exerciseIds: string[] },
): Promise<PlannedWorkout> {
  const db = await getDb();
  const existing = await getPlannedWorkoutForDate(date);
  const plan: PlannedWorkout = {
    id: existing?.id ?? generateId(),
    date,
    routineId: input.routineId,
    exerciseIds: input.exerciseIds,
  };
  await db.put("plannedWorkouts", plan);
  return plan;
}

export async function deletePlannedWorkout(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("plannedWorkouts", id);
}
