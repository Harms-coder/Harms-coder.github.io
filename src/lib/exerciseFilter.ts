import type { Exercise } from "../types";

/**
 * Sentinel-værdi til kategorifilteret, der betyder "kun favoritter".
 * Kollisionsfri, fordi EXERCISE_CATEGORIES er et lukket sæt uden dette navn.
 */
export const FAVORITES_FILTER = "Favoritter";

/**
 * Filtrerer og sorterer øvelser ud fra en valgt kategori og/eller søgetekst.
 * Ved søgning prioriteres navne der starter med søgeteksten, så det
 * opfører sig som et "foreslå nærmeste match" felt.
 */
export function filterExercises(
  exercises: Exercise[],
  category: string | null,
  query: string,
): Exercise[] {
  let list = exercises;
  if (category === FAVORITES_FILTER) list = exercises.filter((e) => e.favorite);
  else if (category) list = exercises.filter((e) => e.category === category);

  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  return list
    .filter((e) => e.name.toLowerCase().includes(trimmed))
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name);
    });
}
