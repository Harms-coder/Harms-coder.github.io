/** Grov silhuet-gruppe, så hver sammenligning kan vises med en passende stregtegning. */
export type ComparisonKind = "person" | "animal" | "whale" | "car" | "truck" | "plane";

interface WeightComparisonItem {
  singular: string;
  plural: string;
  kg: number;
  kind: ComparisonKind;
}

export interface WeightComparison {
  text: string;
  kind: ComparisonKind;
}

/** Løst afrundede gennemsnitsvægte — til sjov perspektivering, ikke faktatjek. */
const WEIGHT_COMPARISONS: WeightComparisonItem[] = [
  { singular: "en voksen person", plural: "voksne personer", kg: 80, kind: "person" },
  { singular: "et køleskab", plural: "køleskabe", kg: 100, kind: "person" },
  { singular: "et klaver", plural: "klaverer", kg: 150, kind: "person" },
  { singular: "en løve", plural: "løver", kg: 190, kind: "animal" },
  { singular: "en tiger", plural: "tigre", kg: 230, kind: "animal" },
  { singular: "en gorilla", plural: "gorillaer", kg: 300, kind: "animal" },
  { singular: "en isbjørn", plural: "isbjørne", kg: 400, kind: "animal" },
  { singular: "en hest", plural: "heste", kg: 500, kind: "animal" },
  { singular: "en ko", plural: "køer", kg: 700, kind: "animal" },
  { singular: "en giraf", plural: "giraffer", kg: 800, kind: "animal" },
  { singular: "en mindre bil", plural: "mindre biler", kg: 1000, kind: "car" },
  { singular: "en almindelig bil", plural: "almindelige biler", kg: 1500, kind: "car" },
  { singular: "en SUV", plural: "SUV'er", kg: 2000, kind: "car" },
  { singular: "en pickup truck", plural: "pickup trucks", kg: 2500, kind: "car" },
  { singular: "et næsehorn", plural: "næsehorn", kg: 3000, kind: "animal" },
  { singular: "en flodhest", plural: "flodheste", kg: 4000, kind: "animal" },
  { singular: "en elefant", plural: "elefanter", kg: 5000, kind: "animal" },
  { singular: "en spækhugger", plural: "spækhuggere", kg: 7000, kind: "whale" },
  { singular: "en skolebus", plural: "skolebusser", kg: 9000, kind: "truck" },
  { singular: "en bybus", plural: "bybusser", kg: 12000, kind: "truck" },
  { singular: "en skraldebil", plural: "skraldebiler", kg: 15000, kind: "truck" },
  { singular: "en lastbil", plural: "lastbiler", kg: 20000, kind: "truck" },
  { singular: "en pukkelhval", plural: "pukkelhvaler", kg: 30000, kind: "whale" },
  { singular: "en sættevogn", plural: "sættevogne", kg: 40000, kind: "truck" },
  { singular: "et jernbanelokomotiv", plural: "jernbanelokomotiver", kg: 60000, kind: "truck" },
  { singular: "en blåhval", plural: "blåhvaler", kg: 90000, kind: "whale" },
  { singular: "en ubåd", plural: "ubåde", kg: 120000, kind: "whale" },
  { singular: "et passagerfly", plural: "passagerfly", kg: 150000, kind: "plane" },
];

const MIN_MULTIPLE = 0.6;
const MAX_MULTIPLE = 30;

/**
 * Vælger en tilfældig, "passende" sammenligning for en given totalvægt (kg) —
 * fx "Det svarer til ca. 4 elefanter". Vælges tilfældigt blandt de referencer der
 * giver et overskueligt antal (0,6-30x), så det varierer i stedet for altid at
 * vise det samme for samme vægtklasse.
 */
export function getWeightComparison(totalKg: number): WeightComparison | undefined {
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

  return {
    text:
      multiple <= 1
        ? `Det svarer til ca. ${chosen.singular}`
        : `Det svarer til ca. ${multiple} ${chosen.plural}`,
    kind: chosen.kind,
  };
}
