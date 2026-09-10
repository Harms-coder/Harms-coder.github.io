import type { Exercise, SetEntry } from "../types";

export interface CategoryLoad {
  category: string;
  sets: number;
  /** Andel af alle talte sæt i perioden, 0-100. */
  percent: number;
}

/**
 * Tæller arbejdssæt pr. øvelseskategori i en periode, så man kan se om træningen er skæv.
 * Opvarmningssæt tælles ikke med — de siger intet om hvor meget arbejde en muskelgruppe
 * har fået. Øvelser uden kategori udelades frem for at ende i en "Andet"-pulje, der
 * ville skjule at de mangler en kategori.
 */
export function buildMuscleBalance(
  sets: SetEntry[],
  exerciseById: Map<string, Exercise>,
  fromDate: string,
): CategoryLoad[] {
  const counts = new Map<string, number>();

  for (const set of sets) {
    if (set.setType === "warmup") continue;
    if (set.createdAt.slice(0, 10) < fromDate) continue;
    const category = exerciseById.get(set.exerciseId)?.category;
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];

  return [...counts.entries()]
    .map(([category, sets]) => ({
      category,
      sets,
      percent: Math.round((sets / total) * 100),
    }))
    .sort((a, b) => b.sets - a.sets);
}
