import type { BodyweightEntry } from "../types";
import { getDb } from "./database";

export async function listBodyweightEntries(): Promise<BodyweightEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("bodyweightEntries", "by-date");
  return all.reverse();
}

export async function createBodyweightEntry(input: {
  date: string;
  weight: number;
}): Promise<BodyweightEntry> {
  const db = await getDb();
  const entry: BodyweightEntry = {
    id: crypto.randomUUID(),
    date: input.date,
    weight: input.weight,
  };
  await db.add("bodyweightEntries", entry);
  return entry;
}

export async function updateBodyweightEntry(
  id: string,
  changes: Partial<Pick<BodyweightEntry, "date" | "weight">>,
): Promise<BodyweightEntry> {
  const db = await getDb();
  const existing = await db.get("bodyweightEntries", id);
  if (!existing) throw new Error("Vægt-log findes ikke");
  const updated: BodyweightEntry = { ...existing, ...changes };
  await db.put("bodyweightEntries", updated);
  return updated;
}

export async function deleteBodyweightEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("bodyweightEntries", id);
}
