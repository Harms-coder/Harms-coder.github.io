export const DA_MONTHS = [
  "januar",
  "februar",
  "marts",
  "april",
  "maj",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "december",
];

export const DA_WEEKDAYS_SHORT = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISODate(): string {
  return toISODate(new Date());
}

/** Den løbende uge (mandag-søndag), som ugentlige mål (træninger/km pr. uge) måles imod. */
export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISODate(monday), end: toISODate(sunday) };
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Mandagen i den uge, datoen ligger i. Bruges til at gruppere pr. uge. */
export function getWeekStart(iso: string): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toISODate(date);
}

/** ISO-ugenummer (uge 1 er ugen med årets første torsdag) — det ugenummer danskere regner i. */
export function getWeekNumber(iso: string): number {
  const date = parseISODate(iso);
  // Ryk til torsdagen i samme uge; året for den torsdag er ISO-ugeåret.
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

/** "2026-09" → "September 2026". */
export function formatMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const name = DA_MONTHS[month - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** Kompakt varighed: 194 → "3 t 14 min", 46 → "46 min". */
export function formatDuration(totalMin: number): string {
  const hours = Math.floor(totalMin / 60);
  const minutes = Math.round(totalMin % 60);
  return hours > 0 ? `${hours} t ${minutes} min` : `${minutes} min`;
}

/** Returns all dates that make up the full weeks (Man-Søn) covering the given month. */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const endOffset = (7 - ((lastOfMonth.getDay() + 6) % 7) - 1) % 7;

  const gridStart = new Date(year, month, 1 - startOffset);
  const gridEnd = new Date(year, month, lastOfMonth.getDate() + endOffset);

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

export function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/** Formats a "YYYY-MM" month key as a short Danish label, e.g. "jan 2026". */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${DA_MONTHS[month - 1].slice(0, 3)} ${year}`;
}

export function formatMediumDate(date: Date): string {
  return `${date.getDate()}. ${DA_MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

export function formatLongDate(date: Date): string {
  const weekdays = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  return `${weekdays[date.getDay()]} d. ${date.getDate()}. ${DA_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
