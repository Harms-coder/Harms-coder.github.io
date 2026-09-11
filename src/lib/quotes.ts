/**
 * Korte motivationslinjer i appens egen stemme — ingen tilskrevet rigtige personer, så der
 * aldrig står et fejlciteret navn i appen.
 *
 * quoteOfTheDay() vælger ud fra datoen, så det samme citat står hele dagen dér, hvor det
 * ikke skal "rulle" (fx kalenderen). Oversigtens boks og Motivation-siden bladrer selv videre
 * fra dagens citat.
 */
export const QUOTES = [
  "Små skridt skaber store resultater.",
  "Konsistens skaber resultater.",
  "Den træning du gennemfører, tæller dobbelt.",
  "Små skridt hver uge slår store spring én gang.",
  "Du skal ikke være bedst — kun bedre end sidst.",
  "Mød op. Resten følger.",
  "Tunge dage bygger stærke uger.",
  "Fremskridt er ikke en lige linje.",
  "Det, du gør ofte, betyder mere end det, du gør hårdt.",
  "Disciplin er at gøre det, også når lysten mangler.",
  "Du fortryder aldrig en gennemført træning.",
  "Styrke bygges i de sæt, du helst ville springe over.",
  "I dag er den bedste dag at begynde igen.",
  "Kroppen følger, hvor hovedet går forrest.",
  "Ét kilo mere. Én gentagelse mere. Én dag ad gangen.",
  "Motivation får dig i gang. Vaner holder dig i gang.",
  "Hvile er en del af træningen — ikke en pause fra den.",
  "Sammenlign dig med dig selv i går. Ingen andre.",
  "Det svære sæt er det, der flytter noget.",
  "Tålmodighed er også en muskel.",
  "Sved i dag er styrke i morgen.",
  "Ingen træning er spildt.",
  "Det er ikke tempoet, der tæller — det er at blive ved.",
  "Gør det simpelt. Gør det ofte.",
  "Du er stærkere end din undskyldning.",
  "Hver gentagelse er en stemme på den, du vil være.",
  "En dårlig træning slår en aflyst træning hver gang.",
  "Byg kroppen langsomt. Så holder den længere.",
  "Målet er ikke perfekt — målet er igen i morgen.",
  "Start hvor du er. Brug det, du har.",
  "Formen kommer, når du holder op med at vente på den.",
  "Vejen er lang. Godt — så er der plads til at blive stærk.",
  "Løft roligt. Løft rigtigt. Løft igen.",
  "Det, du træner i dag, bærer dig om ti år.",
  "Din eneste modstander er den, der siger “i morgen”.",
  "Den første gentagelse er den sværeste. Tag den.",
  "Fremgang gemmer sig i det kedelige.",
  "Én god beslutning ad gangen.",
  "Hviledage bygger. Træningsdage tester.",
  "Stærk er ikke et mål — det er en vane.",
];

/** Indeks for dagens citat: dage siden epoch (lokal midnat), så det skifter ved midnat. */
export function quoteIndexForToday(now = new Date()): number {
  const localMidnight = new Date(now).setHours(0, 0, 0, 0);
  return Math.round(localMidnight / 86_400_000) % QUOTES.length;
}

export function quoteOfTheDay(now = new Date()): string {
  return QUOTES[quoteIndexForToday(now)];
}
