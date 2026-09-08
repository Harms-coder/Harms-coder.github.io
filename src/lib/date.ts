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

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
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

export function formatLongDate(date: Date): string {
  const weekdays = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  return `${weekdays[date.getDay()]} d. ${date.getDate()}. ${DA_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
