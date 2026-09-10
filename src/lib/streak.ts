// Importerne har eksplicit .ts-endelse, så scripts/check.ts kan køre filen direkte i Node.
import { getWeekStart, parseISODate, toISODate } from "./date.ts";
import type { CardioEntry, WorkoutSession } from "../types/index.ts";

const MAX_LOOKBACK_WEEKS = 208;

/**
 * Antal på hinanden følgende uger, hvor ugens træningsmål er nået.
 * Den indeværende uge tæller kun med hvis målet allerede ER nået — ellers ville en
 * streak se brudt ud mandag morgen, hvor man bare ikke har trænet endnu.
 */
export function computeWeeklyStreak(
  allSessions: WorkoutSession[],
  target: number,
  weekStartISO: string,
): number {
  if (target <= 0) return 0;

  const counts = new Map<string, number>();
  for (const session of allSessions) {
    if (!session.endedAt) continue;
    const key = getWeekStart(session.date);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let streak = 0;
  const cursor = parseISODate(weekStartISO);
  if ((counts.get(weekStartISO) ?? 0) >= target) streak++;
  cursor.setDate(cursor.getDate() - 7);

  for (let i = 0; i < MAX_LOOKBACK_WEEKS; i++) {
    const key = toISODate(cursor);
    if ((counts.get(key) ?? 0) < target) break;
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/**
 * Antal uger i træk hvor der er sket NOGET — en gennemført styrketræning, en løbetur
 * eller begge dele. Målt i uger frem for dage, fordi træning planlægges i uger; et tal
 * i dage var desuden misvisende, da den gamle beregning tillod to dages mellemrum og
 * alligevel kaldte resultatet "dage".
 *
 * Den indeværende uge tæller kun med hvis der allerede er sket noget, men bryder aldrig
 * streaken — ellers ville den se brudt ud hver mandag morgen.
 */
export function computeActivityWeekStreak(
  sessions: WorkoutSession[],
  cardio: CardioEntry[],
  todayISO: string,
): number {
  const activeWeeks = new Set<string>();
  for (const session of sessions) {
    if (session.endedAt) activeWeeks.add(getWeekStart(session.date));
  }
  for (const entry of cardio) {
    activeWeeks.add(getWeekStart(entry.date));
  }
  if (activeWeeks.size === 0) return 0;

  let streak = 0;
  const cursor = parseISODate(getWeekStart(todayISO));
  if (activeWeeks.has(toISODate(cursor))) streak++;
  cursor.setDate(cursor.getDate() - 7);

  for (let i = 0; i < MAX_LOOKBACK_WEEKS; i++) {
    if (!activeWeeks.has(toISODate(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}
