import { toISODate } from "./date";

export type RangeKey = "week" | "month" | "quarter" | "halfyear" | "year" | "always";

export const RANGE_LABELS: Record<RangeKey, string> = {
  week: "Uge",
  month: "Måned",
  quarter: "3 mdr",
  halfyear: "6 mdr",
  year: "År",
  always: "Altid",
};

export const RANGE_KEYS = Object.keys(RANGE_LABELS) as RangeKey[];

/**
 * Grafer og periodefiltre starter på "Måned". Oversigt er undtagelsen og starter på "Uge",
 * fordi den viser "hvordan går det lige nu" frem for en historik.
 */
export const DEFAULT_RANGE: RangeKey = "month";

const RANGE_DAYS: Record<Exclude<RangeKey, "always">, number> = {
  week: 7,
  month: 30,
  quarter: 91,
  halfyear: 182,
  year: 365,
};

/** Sentinel-dato langt før al rigtig træningsdata — bruges som "ingen nedre grænse" for "Altid". */
const EPOCH_START = "1900-01-01";

export function getRangeStart(range: RangeKey): string {
  if (range === "always") return EPOCH_START;
  const start = new Date();
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return toISODate(start);
}

/** Den forudgående periode af samme længde, til at vise ↑/↓ vs. sidst. "Altid" har ingen forrige periode. */
export function getPreviousRangeBounds(range: RangeKey): { start: string; end: string } {
  if (range === "always") return { start: EPOCH_START, end: EPOCH_START };
  const end = new Date();
  end.setDate(end.getDate() - RANGE_DAYS[range]);
  const start = new Date(end);
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return { start: toISODate(start), end: toISODate(end) };
}
