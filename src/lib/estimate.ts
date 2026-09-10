/**
 * Groft tidsestimat for en træning ud fra antal øvelser.
 * Tallet er kalibreret efter rigtige, gennemførte træninger i appen (ca. 4 øvelser ≈ 50-60 min),
 * så estimatet ligger tæt på det, en træning faktisk tager — ikke bare tid under stangen.
 */
const MIN_PER_EXERCISE = 13;

export function estimateWorkoutMinutes(exerciseCount: number): number {
  return exerciseCount * MIN_PER_EXERCISE;
}

/** Samme estimat som et interval, til steder hvor usikkerheden skal være tydelig. */
export function estimateWorkoutRange(exerciseCount: number): { low: number; high: number } {
  const estimate = estimateWorkoutMinutes(exerciseCount);
  return { low: Math.round(estimate * 0.85), high: Math.round(estimate * 1.15) };
}
