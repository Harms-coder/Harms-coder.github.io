/**
 * Milepæle for alt, hvad der nogensinde er løftet. Trinnene er runde tal i ton, tæt nok i
 * starten til at man rammer én i sine første måneder, og spredt ud efterhånden.
 */
const MILESTONE_TONNES = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
const MILESTONES_KG = MILESTONE_TONNES.map((tonnes) => tonnes * 1000);

export interface LiftMilestone {
  /** Højeste milepæl der er passeret — undefined før den første. */
  reachedKg?: number;
  /** Næste milepæl — undefined når alle er taget. */
  nextKg?: number;
  /** Vej fra forrige milepæl til den næste, i procent. */
  percent: number;
}

export function getLiftMilestone(totalKg: number): LiftMilestone {
  const nextKg = MILESTONES_KG.find((kg) => kg > totalKg);
  const reachedKg = [...MILESTONES_KG].reverse().find((kg) => kg <= totalKg);
  if (nextKg === undefined) return { reachedKg, percent: 100 };
  const from = reachedKg ?? 0;
  return { reachedKg, nextKg, percent: ((totalKg - from) / (nextKg - from)) * 100 };
}
