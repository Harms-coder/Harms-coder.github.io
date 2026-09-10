/**
 * Korte motivationslinjer. Vælges ud fra ugenummeret frem for tilfældigt, så citatet
 * står fast hele ugen — et citat der skifter hver gang siden tegnes, føles som støj.
 */
const QUOTES = [
  "Konsistens skaber resultater.",
  "Den træning du gennemfører, tæller dobbelt.",
  "Små skridt hver uge slår store spring én gang.",
  "Du skal ikke være bedst — kun bedre end sidst.",
  "Mød op. Resten følger.",
  "Tunge dage bygger stærke uger.",
  "Fremskridt er ikke en lige linje.",
  "Det, du gør ofte, betyder mere end det, du gør hårdt.",
];

export function quoteForWeek(weekNumber: number): string {
  return QUOTES[Math.abs(weekNumber) % QUOTES.length];
}
