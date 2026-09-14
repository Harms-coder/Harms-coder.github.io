import { generateId } from "../lib/id";
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
  measurements?: BodyweightEntry["measurements"];
}): Promise<BodyweightEntry> {
  const db = await getDb();
  const entry: BodyweightEntry = {
    id: generateId(),
    date: input.date,
    weight: input.weight,
    /* Et tomt objekt ville se ud som "målt, men alt er nul" i visningen. */
    measurements:
      input.measurements && Object.keys(input.measurements).length > 0
        ? input.measurements
        : undefined,
  };
  await db.add("bodyweightEntries", entry);
  return entry;
}

export async function updateBodyweightEntry(
  id: string,
  changes: Partial<Pick<BodyweightEntry, "date" | "weight" | "measurements">>,
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
