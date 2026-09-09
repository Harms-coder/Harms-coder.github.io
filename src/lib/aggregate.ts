import { parseISODate, toISODate } from "./date";

/** Returns the ISO date (YYYY-MM-DD) of the Monday of the week containing the given date. */
export function weekKey(dateISO: string): string {
  const date = parseISODate(dateISO);
  const dayOffset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - dayOffset);
  return toISODate(date);
}

/** Returns the YYYY-MM month key for the given date. */
export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

/** Sums `valueFn(item)` per key, keyed and sorted ascending by `keyFn(item)`. */
export function sumByKey<T>(
  items: T[],
  keyFn: (item: T) => string,
  valueFn: (item: T) => number,
): { key: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    totals.set(key, (totals.get(key) ?? 0) + valueFn(item));
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => ({ key, total }));
}
