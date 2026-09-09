import type { Exercise, SetEntry } from "../types";

export interface StrengthGain {
  name: string;
  percent: number;
}

/** Procentvis stigning fra første til seneste (eller PR) vægt, pr. øvelse med nok historik. */
export function buildStrengthGains(
  exercises: Exercise[],
  setsByExercise: Map<string, SetEntry[]>,
): StrengthGain[] {
  const gains: StrengthGain[] = [];
  for (const exercise of exercises) {
    const sets = (setsByExercise.get(exercise.id) ?? [])
      .filter((s) => s.setType !== "warmup")
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sets.length < 2) continue;
    const firstWeight = sets[0].weight;
    if (!firstWeight) continue;
    const currentWeight = exercise.prWeight ?? sets[sets.length - 1].weight;
    const percent = ((currentWeight - firstWeight) / firstWeight) * 100;
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
