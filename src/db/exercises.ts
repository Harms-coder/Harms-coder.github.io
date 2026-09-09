import { generateId } from "../lib/id";
import type { Exercise } from "../types";
import { getDb } from "./database";

export async function listExercises(): Promise<Exercise[]> {
  const db = await getDb();
  return db.getAllFromIndex("exercises", "by-name");
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  const db = await getDb();
  return db.get("exercises", id);
}

export async function createExercise(input: {
  name: string;
  category?: string;
}): Promise<Exercise> {
  const db = await getDb();
  const exercise: Exercise = {
    id: generateId(),
    name: input.name.trim(),
    category: input.category?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  await db.add("exercises", exercise);
  return exercise;
}

type ExerciseUpdate = Partial<
  Pick<Exercise, "name" | "category" | "prWeight" | "prReps" | "prDate" | "pr1RM" | "pr1RMDate">
>;

export async function updateExercise(
  id: string,
  changes: ExerciseUpdate,
): Promise<Exercise> {
  const db = await getDb();
  const existing = await db.get("exercises", id);
  if (!existing) throw new Error("Øvelse findes ikke");
  const updated: Exercise = { ...existing, ...changes };
  await db.put("exercises", updated);
  return updated;
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("exercises", id);
}

/**
 * Opdaterer øvelsens tungeste sæt-PR hvis det angivne vægt/reps-par slår den:
 * højere vægt vinder altid, ved samme vægt vinder flere reps.
 */
export async function maybeUpdatePr(
  exerciseId: string,
  weight: number,
  reps: number,
): Promise<Exercise | undefined> {
  const db = await getDb();
  const existing = await db.get("exercises", exerciseId);
  if (!existing) return undefined;

  const beatsPr =
    existing.prWeight === undefined ||
    weight > existing.prWeight ||
    (weight === existing.prWeight && (existing.prReps === undefined || reps > existing.prReps));

  if (!beatsPr) return existing;

  const updated: Exercise = {
    ...existing,
    prWeight: weight,
    prReps: reps,
    prDate: new Date().toISOString(),
  };
  await db.put("exercises", updated);
  return updated;
}
