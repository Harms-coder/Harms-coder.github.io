import { generateId } from "../lib/id";
import type { WorkoutSession } from "../types";
import { getDb } from "./database";

export async function getActiveSession(): Promise<WorkoutSession | undefined> {
  const db = await getDb();
  const all = await db.getAll("workoutSessions");
  return all.find((session) => !session.endedAt);
}

export async function listSessions(): Promise<WorkoutSession[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("workoutSessions", "by-date");
  return all.reverse();
}

export async function listSessionsInRange(
  startDate: string,
  endDate: string,
): Promise<WorkoutSession[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("workoutSessions", "by-date");
  return all.filter((session) => session.date >= startDate && session.date <= endDate);
}

export async function startSession(): Promise<WorkoutSession> {
  const db = await getDb();
  const now = new Date();
  const session: WorkoutSession = {
    id: generateId(),
    date: now.toISOString().slice(0, 10),
    startedAt: now.toISOString(),
  };
  await db.add("workoutSessions", session);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("workoutSessions", id);
}

export async function endSession(id: string): Promise<WorkoutSession> {
  const db = await getDb();
  const existing = await db.get("workoutSessions", id);
  if (!existing) throw new Error("Session findes ikke");
  const endedAt = new Date();
  const durationMin = Math.max(
    1,
    Math.round((endedAt.getTime() - new Date(existing.startedAt).getTime()) / 60000),
  );
  const updated: WorkoutSession = {
    ...existing,
    endedAt: endedAt.toISOString(),
    durationMin,
  };
  await db.put("workoutSessions", updated);
  return updated;
}
