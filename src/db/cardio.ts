import { generateId } from "../lib/id";
import type { CardioEntry } from "../types";
import { getDb } from "./database";

export const CARDIO_ACTIVITIES = ["Løb", "Gang", "Cykling", "Svømning", "Roning", "Andet"] as const;

export async function listCardioEntries(): Promise<CardioEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("cardioEntries", "by-date");
  return all.reverse();
}

export async function listCardioEntriesInRange(
  startDate: string,
  endDate: string,
): Promise<CardioEntry[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("cardioEntries", "by-date");
  return all.filter((entry) => entry.date >= startDate && entry.date <= endDate);
}

export async function createCardioEntry(input: {
  date: string;
  activity: string;
  distanceKm: number;
  durationMin: number;
  notes?: string;
}): Promise<CardioEntry> {
  const db = await getDb();
  const entry: CardioEntry = {
    id: generateId(),
    date: input.date,
    activity: input.activity.trim(),
    distanceKm: input.distanceKm,
    durationMin: input.durationMin,
    notes: input.notes?.trim() || undefined,
  };
  await db.add("cardioEntries", entry);
  return entry;
}

type CardioEntryUpdate = Partial<
  Pick<CardioEntry, "date" | "activity" | "distanceKm" | "durationMin" | "notes">
>;

export async function updateCardioEntry(
  id: string,
  changes: CardioEntryUpdate,
): Promise<CardioEntry> {
  const db = await getDb();
  const existing = await db.get("cardioEntries", id);
  if (!existing) throw new Error("Cardio-log findes ikke");
  const updated: CardioEntry = { ...existing, ...changes };
  await db.put("cardioEntries", updated);
  return updated;
}

export async function deleteCardioEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("cardioEntries", id);
}
