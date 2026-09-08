import type { Routine } from "../types";
import { getDb } from "./database";

export async function listRoutines(): Promise<Routine[]> {
  const db = await getDb();
  const all = await db.getAll("routines");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRoutine(input: {
  name: string;
  exerciseIds: string[];
}): Promise<Routine> {
  const db = await getDb();
  const routine: Routine = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    exerciseIds: input.exerciseIds,
    createdAt: new Date().toISOString(),
  };
  await db.add("routines", routine);
  return routine;
}

export async function updateRoutine(
  id: string,
  changes: Partial<Pick<Routine, "name" | "exerciseIds">>,
): Promise<Routine> {
  const db = await getDb();
  const existing = await db.get("routines", id);
  if (!existing) throw new Error("Gruppe findes ikke");
  const updated: Routine = { ...existing, ...changes };
  await db.put("routines", updated);
  return updated;
}

export async function deleteRoutine(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("routines", id);
}
