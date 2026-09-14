/**
 * Supersæt gemmes som par af øvelse-id'er på programmet. En øvelse kan kun stå i ét par,
 * så al logik her rydder op i gamle par, før den laver et nyt.
 */

/** Parret som øvelsen indgår i, eller undefined hvis den kører alene. */
export function pairFor(supersets: string[][] | undefined, exerciseId: string): string[] | undefined {
  return supersets?.find((pair) => pair.includes(exerciseId));
}

export function arePaired(supersets: string[][] | undefined, a: string, b: string): boolean {
  const pair = pairFor(supersets, a);
  return pair !== undefined && pair.includes(b);
}

/** Slår parret til eller fra for to øvelser. Begge løsrives først fra det, de ellers stod i. */
export function togglePair(supersets: string[][] | undefined, a: string, b: string): string[][] {
  const rest = (supersets ?? []).filter((pair) => !pair.includes(a) && !pair.includes(b));
  return arePaired(supersets, a, b) ? rest : [...rest, [a, b]];
}

/** Fjerner par, hvor en øvelse er taget ud af programmet — ellers peger de på ingenting. */
export function prunePairs(supersets: string[][] | undefined, exerciseIds: string[]): string[][] {
  return (supersets ?? []).filter((pair) => pair.every((id) => exerciseIds.includes(id)));
}
