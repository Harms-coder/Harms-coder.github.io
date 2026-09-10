// Importerne har eksplicit .ts-endelse, så scripts/check.ts kan køre filen direkte i Node.
import { getWeekStart, parseISODate, toISODate } from "./date.ts";
import type { WorkoutSession } from "../types/index.ts";

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
