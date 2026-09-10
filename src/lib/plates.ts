/** Standard olympisk stang. Kun denne ene — appen har ingen udstyrsopsætning. */
export const BAR_KG = 20;

/** Skiver i faldende orden, som de typisk findes i et almindeligt center. */
const PLATE_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

export interface PlatePlan {
  /** Skiver på ÉN side af stangen, tungeste først. */
  perSide: number[];
  /** Vægt der ikke kunne dækkes af skiverne, fx hvis totalen ikke går op. */
  leftoverKg: number;
}

/*
 * ponytail: nøgleords-heuristik frem for et udstyrsfelt på øvelsen. Rammer de
 * stang-øvelser der findes i standardbiblioteket; en øvelse brugeren selv opretter
 * med et kreativt navn får ingen skiveberegning. Tilføj et equipment-felt på Exercise,
 * hvis det bliver et reelt problem.
 */
const BARBELL_HINTS = [
  "vægtstang",
  "bænkpres",
  "squat",
  "dødløft",
  "military press",
  "ez-bar",
  "close-grip",
  "upright row",
  "t-bar",
  "landmine",
  "clean and press",
  "thruster",
  "snatch",
  "hip thrust",
  "fransk pres",
  "stående roning",
];

export function isBarbellExercise(name: string): boolean {
  const lower = name.toLowerCase();
  // Håndvægt-varianter bærer samme grundnavn, så de skal udelukkes eksplicit.
  if (lower.includes("håndvægt") || lower.includes("dumbbell") || lower.includes("kettlebell")) {
    return false;
  }
  return BARBELL_HINTS.some((hint) => lower.includes(hint));
}

/**
 * Hvilke skiver der skal på hver side for at ramme totalvægten, stangen medregnet.
 * Regner i gram-heltal, fordi 1,25 og 2,5 kg ikke kan repræsenteres præcist som
 * flydende tal — ellers ender man med rester som 0.0000000001 kg.
 */
export function platesPerSide(totalKg: number): PlatePlan | undefined {
  if (!Number.isFinite(totalKg) || totalKg < BAR_KG) return undefined;

  let remainingG = Math.round(((totalKg - BAR_KG) / 2) * 1000);
  if (remainingG === 0) return { perSide: [], leftoverKg: 0 };

  const perSide: number[] = [];
  for (const plate of PLATE_KG) {
    const plateG = Math.round(plate * 1000);
    while (remainingG >= plateG) {
      perSide.push(plate);
      remainingG -= plateG;
    }
  }

  return { perSide, leftoverKg: (remainingG * 2) / 1000 };
}

/** "20 + 15 + 1,25" — dansk decimalkomma, tungeste skive først. */
export function formatPlates(perSide: number[]): string {
  return perSide.map((p) => p.toString().replace(".", ",")).join(" + ");
}
