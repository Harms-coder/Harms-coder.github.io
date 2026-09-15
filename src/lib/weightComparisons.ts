/** Hver sammenligning har sin egen silhuet (tegnet i scripts/silhouettes.py). */
export type ComparisonKind =
  | "person" | "fridge" | "piano"
  | "lion" | "tiger" | "gorilla" | "bear" | "horse" | "cow" | "giraffe"
  | "rhino" | "hippo" | "elephant" | "orca" | "whale"
  | "smallcar" | "car" | "suv" | "pickup" | "bus" | "garbage" | "semi" | "locomotive" | "submarine" | "plane";

interface WeightComparisonItem {
  singular: string;
  plural: string;
  kg: number;
  kind: ComparisonKind;
}

export interface WeightComparison {
  text: string;
  /** Én ting — eller to ved en sammensætning ("2 elefanter og 3 køer"). */
  kinds: ComparisonKind[];
}

/** Løst afrundede gennemsnitsvægte — til sjov perspektivering, ikke faktatjek. */
const WEIGHT_COMPARISONS: WeightComparisonItem[] = [
  { singular: "en voksen person", plural: "voksne personer", kg: 80, kind: "person" },
  { singular: "et køleskab", plural: "køleskabe", kg: 100, kind: "fridge" },
  { singular: "et klaver", plural: "klaverer", kg: 150, kind: "piano" },
  { singular: "en løve", plural: "løver", kg: 190, kind: "lion" },
  { singular: "en tiger", plural: "tigre", kg: 230, kind: "tiger" },
  { singular: "en gorilla", plural: "gorillaer", kg: 300, kind: "gorilla" },
  { singular: "en bjørn", plural: "bjørne", kg: 400, kind: "bear" },
  { singular: "en hest", plural: "heste", kg: 500, kind: "horse" },
  { singular: "en ko", plural: "køer", kg: 700, kind: "cow" },
  { singular: "en giraf", plural: "giraffer", kg: 800, kind: "giraffe" },
  { singular: "en mindre bil", plural: "mindre biler", kg: 1000, kind: "smallcar" },
  { singular: "en almindelig bil", plural: "almindelige biler", kg: 1500, kind: "car" },
  { singular: "en SUV", plural: "SUV'er", kg: 2000, kind: "suv" },
  { singular: "en pickup truck", plural: "pickup trucks", kg: 2500, kind: "pickup" },
  { singular: "et næsehorn", plural: "næsehorn", kg: 3000, kind: "rhino" },
  { singular: "en flodhest", plural: "flodheste", kg: 4000, kind: "hippo" },
  { singular: "en elefant", plural: "elefanter", kg: 5000, kind: "elephant" },
  { singular: "en spækhugger", plural: "spækhuggere", kg: 7000, kind: "orca" },
  { singular: "en skolebus", plural: "skolebusser", kg: 9000, kind: "bus" },
  { singular: "en bybus", plural: "bybusser", kg: 12000, kind: "bus" },
  { singular: "en skraldebil", plural: "skraldebiler", kg: 15000, kind: "garbage" },
  { singular: "en pukkelhval", plural: "pukkelhvaler", kg: 30000, kind: "whale" },
  { singular: "en lastbil", plural: "lastbiler", kg: 40000, kind: "semi" },
  { singular: "et jernbanelokomotiv", plural: "jernbanelokomotiver", kg: 60000, kind: "locomotive" },
  { singular: "en blåhval", plural: "blåhvaler", kg: 90000, kind: "whale" },
  { singular: "en ubåd", plural: "ubåde", kg: 120000, kind: "submarine" },
  { singular: "et passagerfly", plural: "passagerfly", kg: 150000, kind: "plane" },
];

const MIN_MULTIPLE = 0.6;
const MAX_MULTIPLE = 300;
/** Sammensætninger: den lette del må højst optræde dette antal gange, ellers bliver sætningen lang. */
const MAX_SECONDARY = 9;
const MAX_COMBOS = 30;
/** Længste sammenligningstekst der kan være på tre linjer i Oversigt-flisen. */
const MAX_TEXT_LENGTH = 46;

function count(item: WeightComparisonItem, n: number): string {
  return n <= 1 ? item.singular : `${n} ${item.plural}`;
}

/**
 * Alle "passende" sammenligninger for en given totalvægt (kg): enkelte ting, der giver et
 * overskueligt antal (0,6-300x), plus sammensætninger af to ting, der tilsammen rammer vægten
 * ("ca. 2 elefanter og 3 køer"). Rækkefølgen er tilfældig, så Oversigt kan bladre igennem dem.
 * Ting med et rigtigt billede (preferred) foretrækkes, så billederne faktisk bliver set.
 * withCombos=false giver kun enkelte ting (Milepæle-kortet, hvor to billeder så underligt ud).
 */
export function listWeightComparisons(
  totalKg: number,
  preferred: ReadonlySet<ComparisonKind> = new Set(),
  withCombos = true,
): WeightComparison[] {
  if (!Number.isFinite(totalKg) || totalKg < 40) return [];

  const inRange = WEIGHT_COMPARISONS.filter((item) => {
    const multiple = totalKg / item.kg;
    return multiple >= MIN_MULTIPLE && multiple <= MAX_MULTIPLE;
  });
  const withPhoto = inRange.filter((item) => preferred.has(item.kind));
  const pool = withPhoto.length > 0 ? withPhoto : inRange;

  const singles: WeightComparison[] = pool.map((item) => ({
    text: `Det svarer til ca. ${count(item, Math.round(totalKg / item.kg))}`,
    kinds: [item.kind],
  }));

  // Sammensætninger: n af den tunge ting, og resten fyldt op med en lettere ting.
  const combos: WeightComparison[] = [];
  for (const heavy of pool) {
    const n = Math.floor(totalKg / heavy.kg);
    if (n < 1 || n > 30) continue;
    const rest = totalKg - n * heavy.kg;
    for (const light of pool) {
      if (light.kg >= heavy.kg) continue;
      const m = Math.round(rest / light.kg);
      if (m < 1 || m > MAX_SECONDARY || Math.abs(rest - m * light.kg) > light.kg * 0.35) continue;
      const text = `Det svarer til ca. ${count(heavy, n)} og ${count(light, m)}`;
      /* Flisen har fast højde til tre linjer — længere sammensætninger springer vi over. */
      if (text.length > MAX_TEXT_LENGTH) continue;
      combos.push({ text, kinds: [heavy.kind, light.kind] });
    }
  }

  if (singles.length === 0) {
    const nearest = WEIGHT_COMPARISONS.reduce((best, item) =>
      Math.abs(Math.log(totalKg / item.kg)) < Math.abs(Math.log(totalKg / best.kg)) ? item : best,
    );
    return [{ text: `Det svarer til ca. ${count(nearest, Math.round(totalKg / nearest.kg))}`, kinds: [nearest.kind] }];
  }
  return shuffle(withCombos ? [...singles, ...shuffle(combos).slice(0, MAX_COMBOS)] : singles);
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
