import { generateId } from "../lib/id";
import type { Routine } from "../types";
import { getDb } from "./database";

export const ROUTINE_COLORS = [
  "#4E9F6E",
  "#4A85C4",
  "#5B6FD6",
  "#8B6FC4",
  "#C4638F",
  "#D1A23E",
  "#3F9E96",
  "#C7784A",
] as const;

export async function listRoutines(): Promise<Routine[]> {
  const db = await getDb();
  const all = await db.getAll("routines");
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRoutine(input: {
  name: string;
  exerciseIds: string[];
  color?: string;
}): Promise<Routine> {
  const db = await getDb();
  const routine: Routine = {
    id: generateId(),
    name: input.name.trim(),
    exerciseIds: input.exerciseIds,
    color: input.color,
    createdAt: new Date().toISOString(),
  };
  await db.add("routines", routine);
  return routine;
}

export async function updateRoutine(
  id: string,
  changes: Partial<Pick<Routine, "name" | "exerciseIds" | "color">>,
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
