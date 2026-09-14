import type { Exercise, SetEntry } from "../types";

export interface MuscleLoad {
  /** Arbejdssæt i perioden. */
  sets: number;
  /** Samlet vægt løftet i perioden (kg × gentagelser). */
  volumeKg: number;
  /** Dage siden kategorien sidst blev trænet — undefined hvis aldrig. */
  daysSince?: number;
  /** Belastning i forhold til den hårdest trænede kategori, 0-1. Styrer farven på kroppen. */
  intensity: number;
}

/**
 * Belastning pr. øvelseskategori i en periode, til muskel-heatmappet.
 *
 * Intensiteten er relativ, ikke absolut: den hårdest trænede kategori er altid 1. Et heatmap skal
 * vise skævheden i træningen, og en absolut skala ville farve hele kroppen svagt i en rolig uge.
 * Opvarmningssæt tælles ikke med — de siger intet om, hvor meget arbejde musklen har fået.
 */
export function buildMuscleHeatmap(
  sets: SetEntry[],
  exerciseById: Map<string, Exercise>,
  fromDate: string,
  today: string,
): Map<string, MuscleLoad> {
  const raw = new Map<string, { sets: number; volumeKg: number; lastDate?: string }>();

  for (const set of sets) {
    const category = exerciseById.get(set.exerciseId)?.category;
    if (!category) continue;
    const date = set.createdAt.slice(0, 10);

    const entry = raw.get(category) ?? { sets: 0, volumeKg: 0 };
    /* Sidste træningsdag tælles over hele historikken — ellers ville en muskel, der ikke er
       rørt i perioden, fremstå som "aldrig trænet" frem for "hvilet i 12 dage". */
    if (!entry.lastDate || date > entry.lastDate) entry.lastDate = date;
    if (set.setType !== "warmup" && date >= fromDate) {
      entry.sets += 1;
      entry.volumeKg += set.weight * set.reps;
    }
    raw.set(category, entry);
  }

  const maxVolume = Math.max(0, ...[...raw.values()].map((e) => e.volumeKg));
  const todayMs = Date.parse(today);

  const result = new Map<string, MuscleLoad>();
  for (const [category, entry] of raw) {
    result.set(category, {
      sets: entry.sets,
      volumeKg: entry.volumeKg,
      daysSince: entry.lastDate
        ? Math.max(0, Math.round((todayMs - Date.parse(entry.lastDate)) / 86_400_000))
        : undefined,
      intensity: maxVolume > 0 ? entry.volumeKg / maxVolume : 0,
    });
  }
  return result;
}

/** Kort tekst om hvor udhvilet muskelgruppen er. */
export function restLabel(load: MuscleLoad | undefined): string {
  if (!load || load.daysSince === undefined) return "Ikke trænet endnu";
  if (load.daysSince === 0) return "Trænet i dag";
  if (load.daysSince === 1) return "Trænet i går";
  if (load.daysSince <= 3) return `Trænet for ${load.daysSince} dage siden`;
  return `Hvilet ${load.daysSince} dage`;
}
