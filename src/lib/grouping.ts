import { getWeekMonthKey, getWeekStart } from "./date.ts";

export interface WeekGroup<T> {
  /** Mandagen i ugen, ISO. */
  key: string;
  items: T[];
}

export interface MonthGroup<T> {
  /** "2026-09". */
  key: string;
  weeks: WeekGroup<T>[];
  count: number;
}

/**
 * Grupperer daterede poster i måneder → uger, nyeste først.
 *
 * Der grupperes uge FØRST, så en uge der går på tværs af to måneder kun optræder ét sted;
 * den havner i den måned dens torsdag ligger i (samme regel som ISO-ugenumre). Uden det
 * ville fx ugen 31. aug – 6. sep dukke op både i august og september.
 */
export function groupByMonthAndWeek<T>(
  items: T[],
  getDate: (item: T) => string,
): MonthGroup<T>[] {
  const byWeek = new Map<string, T[]>();
  for (const item of items) {
    const weekKey = getWeekStart(getDate(item));
    byWeek.set(weekKey, [...(byWeek.get(weekKey) ?? []), item]);
  }

  const byMonth = new Map<string, WeekGroup<T>[]>();
  for (const [weekKey, weekItems] of byWeek) {
    const monthKey = getWeekMonthKey(weekKey);
    byMonth.set(monthKey, [...(byMonth.get(monthKey) ?? []), { key: weekKey, items: weekItems }]);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, weeks]) => {
      const sorted = [...weeks].sort((a, b) => b.key.localeCompare(a.key));
      return {
        key,
        weeks: sorted,
        count: sorted.reduce((sum, week) => sum + week.items.length, 0),
      };
    });
}
