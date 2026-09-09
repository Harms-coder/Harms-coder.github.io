import type { SetEntry } from "../../types";

/** Rækkefølgen øvelserne først dukkede op i, ud fra hvornår deres første sæt blev logget. */
export function orderFromSets(sessionSets: SetEntry[]): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  for (const set of [...sessionSets].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    if (!seen.has(set.exerciseId)) {
      seen.add(set.exerciseId);
      order.push(set.exerciseId);
    }
  }
  return order;
}
