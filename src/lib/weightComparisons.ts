interface WeightComparisonItem {
  singular: string;
  plural: string;
  kg: number;
}

/** Løst afrundede gennemsnitsvægte — til sjov perspektivering, ikke faktatjek. */
const WEIGHT_COMPARISONS: WeightComparisonItem[] = [
  { singular: "en voksen person", plural: "voksne personer", kg: 80 },
  { singular: "et køleskab", plural: "køleskabe", kg: 100 },
  { singular: "et klaver", plural: "klaverer", kg: 150 },
  { singular: "en løve", plural: "løver", kg: 190 },
  { singular: "en tiger", plural: "tigre", kg: 230 },
  { singular: "en gorilla", plural: "gorillaer", kg: 300 },
  { singular: "en isbjørn", plural: "isbjørne", kg: 400 },
  { singular: "en hest", plural: "heste", kg: 500 },
  { singular: "en ko", plural: "køer", kg: 700 },
  { singular: "en giraf", plural: "giraffer", kg: 800 },
  { singular: "en mindre bil", plural: "mindre biler", kg: 1000 },
  { singular: "en almindelig bil", plural: "almindelige biler", kg: 1500 },
  { singular: "en SUV", plural: "SUV'er", kg: 2000 },
  { singular: "en pickup truck", plural: "pickup trucks", kg: 2500 },
  { singular: "et næsehorn", plural: "næsehorn", kg: 3000 },
  { singular: "en flodhest", plural: "flodheste", kg: 4000 },
  { singular: "en elefant", plural: "elefanter", kg: 5000 },
  { singular: "en spækhugger", plural: "spækhuggere", kg: 7000 },
  { singular: "en skolebus", plural: "skolebusser", kg: 9000 },
  { singular: "en bybus", plural: "bybusser", kg: 12000 },
  { singular: "en skraldebil", plural: "skraldebiler", kg: 15000 },
  { singular: "en lastbil", plural: "lastbiler", kg: 20000 },
  { singular: "en pukkelhval", plural: "pukkelhvaler", kg: 30000 },
  { singular: "en sættevogn", plural: "sættevogne", kg: 40000 },
  { singular: "et jernbanelokomotiv", plural: "jernbanelokomotiver", kg: 60000 },
  { singular: "en blåhval", plural: "blåhvaler", kg: 90000 },
  { singular: "en ubåd", plural: "ubåde", kg: 120000 },
  { singular: "et passagerfly", plural: "passagerfly", kg: 150000 },
];

const MIN_MULTIPLE = 0.6;
const MAX_MULTIPLE = 30;

/**
 * Vælger en tilfældig, "passende" sammenligning for en given totalvægt (kg) —
 * fx "Det svarer til ca. 4 elefanter". Vælges tilfældigt blandt de referencer der
 * giver et overskueligt antal (0,6-30x), så det varierer i stedet for altid at
 * vise det samme for samme vægtklasse.
 */
export function getWeightComparison(totalKg: number): string | undefined {
  if (!Number.isFinite(totalKg) || totalKg < 40) return undefined;

  const inRange = WEIGHT_COMPARISONS.filter((item) => {
    const multiple = totalKg / item.kg;
    return multiple >= MIN_MULTIPLE && multiple <= MAX_MULTIPLE;
  });

  const candidates =
    inRange.length > 0
      ? inRange
      : [
          WEIGHT_COMPARISONS.reduce((best, item) =>
            Math.abs(Math.log(totalKg / item.kg)) < Math.abs(Math.log(totalKg / best.kg))
              ? item
              : best,
          ),
        ];

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const multiple = Math.round(totalKg / chosen.kg);

  return multiple <= 1
    ? `Det svarer til ca. ${chosen.singular}`
    : `Det svarer til ca. ${multiple} ${chosen.plural}`;
}
