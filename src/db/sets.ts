import { generateId } from "../lib/id";
import type { SetEntry, SetType } from "../types";
import { getDb } from "./database";

export async function listSetsForSession(sessionId: string): Promise<SetEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("sets", "by-session", sessionId);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listAllSets(): Promise<SetEntry[]> {
  const db = await getDb();
  return db.getAll("sets");
}

export async function listSetsForExercise(exerciseId: string): Promise<SetEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("sets", "by-exercise", exerciseId);
  return all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getLastSetForExercise(
  exerciseId: string,
): Promise<SetEntry | undefined> {
  const db = await getDb();
  const all = await db.getAllFromIndex("sets", "by-exercise", exerciseId);
  if (all.length === 0) return undefined;
  return all.reduce((latest, set) => (set.createdAt > latest.createdAt ? set : latest));
}

/**
 * Sidste sæt for øvelsen fra en tidligere træning — grundlaget for "Sidst: 80 kg × 8".
 * Sæt fra den igangværende træning tæller ikke med, ellers ville "som sidst" bare gentage
 * det, man netop har logget.
 */
export async function getLastSetFromEarlierSession(
  exerciseId: string,
  currentSessionId: string,
): Promise<SetEntry | undefined> {
  const db = await getDb();
  const all = await db.getAllFromIndex("sets", "by-exercise", exerciseId);
  const earlier = all.filter((set) => set.sessionId !== currentSessionId);
  if (earlier.length === 0) return undefined;
  return earlier.reduce((latest, set) => (set.createdAt > latest.createdAt ? set : latest));
}

export async function addSet(input: {
  sessionId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setType: SetType;
  order: number;
}): Promise<SetEntry> {
  const db = await getDb();
  const set: SetEntry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  await db.add("sets", set);
  return set;
}

export async function deleteSet(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("sets", id);
}
