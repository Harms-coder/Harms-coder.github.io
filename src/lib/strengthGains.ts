import type { Exercise, SetEntry } from "../types";

export interface StrengthGain {
  name: string;
  percent: number;
}

/**
 * Procentvis stigning i vægt pr. øvelse med nok historik, inden for en periode.
 * Baseline er vægten lige før perioden startede (så "sidste måned" viser fremgang i den måned),
 * eller den først loggede vægt hvis øvelsen slet ikke er logget før perioden (fx "Altid").
 * `rangeStart` er en YYYY-MM-DD-dato; en sentinel langt tilbage i tid giver reelt "ingen nedre grænse".
 */
export function buildStrengthGains(
  exercises: Exercise[],
  setsByExercise: Map<string, SetEntry[]>,
  rangeStart: string,
): StrengthGain[] {
  const gains: StrengthGain[] = [];
  for (const exercise of exercises) {
    const sets = (setsByExercise.get(exercise.id) ?? [])
      .filter((s) => s.setType !== "warmup")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sets.length < 2) continue;

    const inRange = sets.filter((s) => s.createdAt.slice(0, 10) >= rangeStart);
    if (inRange.length === 0) continue;

    const before = sets.filter((s) => s.createdAt.slice(0, 10) < rangeStart);
    const baselineWeight = before.length > 0 ? before[before.length - 1].weight : inRange[0].weight;
    if (!baselineWeight) continue;

    const currentWeight = exercise.prWeight ?? sets[sets.length - 1].weight;
    const percent = ((currentWeight - baselineWeight) / baselineWeight) * 100;
    if (!Number.isFinite(percent)) continue;
    gains.push({ name: exercise.name, percent: Math.round(percent * 10) / 10 });
  }
  return gains;
}

export function groupSetsByExercise(sets: SetEntry[]): Map<string, SetEntry[]> {
  const map = new Map<string, SetEntry[]>();
  for (const set of sets) {
    const list = map.get(set.exerciseId) ?? [];
    list.push(set);
    map.set(set.exerciseId, list);
  }
  return map;
}
