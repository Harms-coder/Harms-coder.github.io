import { parseISODate, toISODate } from "../lib/date";
import { generateId } from "../lib/id";
import type { PlannedStatus, PlannedWorkout } from "../types";
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

/**
 * Lægger den samme plan på den valgte dag og på samme ugedag de følgende uger.
 * Planerne skrives som almindelige enkeltdage frem for som en gentagelsesregel, så en
 * enkelt dag bagefter kan ændres eller fjernes uden at røre de øvrige.
 */
export async function setPlannedWorkoutSeries(
  startDate: string,
  occurrences: number,
  input: { routineId?: string; exerciseIds: string[] },
): Promise<number> {
  const cursor = parseISODate(startDate);
  for (let i = 0; i < occurrences; i++) {
    await setPlannedWorkout(toISODate(cursor), input);
    cursor.setDate(cursor.getDate() + 7);
  }
  return occurrences;
}

export async function setPlannedStatus(
  id: string,
  status: PlannedStatus,
): Promise<PlannedWorkout | undefined> {
  const db = await getDb();
  const existing = await db.get("plannedWorkouts", id);
  if (!existing) return undefined;
  const updated: PlannedWorkout = { ...existing, status };
  await db.put("plannedWorkouts", updated);
  return updated;
}

/**
 * Flytter en plan til en anden dag. Ligger der allerede en plan på måldagen, overskrives
 * den — én plan pr. dag er hele modellen, og to planer samme dag ville ikke kunne vises.
 */
export async function movePlannedWorkout(
  id: string,
  toDate: string,
): Promise<PlannedWorkout | undefined> {
  const db = await getDb();
  const existing = await db.get("plannedWorkouts", id);
  if (!existing) return undefined;

  const atTarget = await getPlannedWorkoutForDate(toDate);
  if (atTarget && atTarget.id !== id) {
    await db.delete("plannedWorkouts", atTarget.id);
  }
  const moved: PlannedWorkout = { ...existing, date: toDate, status: "postponed" };
  await db.put("plannedWorkouts", moved);
  return moved;
}

export async function deletePlannedWorkout(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("plannedWorkouts", id);
}
