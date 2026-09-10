// Importerne har eksplicit .ts-endelse, så scripts/check.ts kan køre filen direkte i Node.
import { parseISODate, toISODate } from "./date.ts";
import type { BodyweightEntry } from "../types/index.ts";

const MAX_PROJECTION_DAYS = 3650;

/**
 * Lineær fremskrivning af hvornår kropsvægtsmålet nås, ud fra den seneste trend.
 * Returnerer undefined når et svar ville være vildledende: for få målinger, ingen reel
 * trend, eller en trend der bevæger sig VÆK fra målet — dér findes der ingen dato.
 */
export function computeProjectedGoalDate(
  recentAscending: BodyweightEntry[],
  target: number,
): string | undefined {
  if (recentAscending.length < 2) return undefined;

  const first = recentAscending[0];
  const last = recentAscending[recentAscending.length - 1];
  const daysBetween =
    (parseISODate(last.date).getTime() - parseISODate(first.date).getTime()) / 86_400_000;
  if (daysBetween <= 0) return undefined;

  const ratePerDay = (last.weight - first.weight) / daysBetween;
  const remaining = target - last.weight;
  if (Math.abs(ratePerDay) < 0.001) return undefined;

  /*
   * daysNeeded er kun positiv når trenden bevæger sig MOD målet: går den den forkerte vej,
   * har remaining og ratePerDay modsat fortegn, og resultatet bliver negativt. Derfor
   * dækker dette ene tjek både "ingen vej dertil" og "urimeligt langt ude".
   */
  const daysNeeded = remaining / ratePerDay;
  if (!Number.isFinite(daysNeeded) || daysNeeded <= 0 || daysNeeded > MAX_PROJECTION_DAYS) {
    return undefined;
  }

  const projected = parseISODate(last.date);
  projected.setDate(projected.getDate() + Math.round(daysNeeded));
  return toISODate(projected);
}
