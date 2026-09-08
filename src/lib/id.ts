/**
 * crypto.randomUUID() findes kun i sikre kontekster (https, eller localhost).
 * Testes appen fra en telefon over almindelig http (fx via lokal netværks-IP),
 * er window.crypto.randomUUID undefined, og oprettelser fejler stille.
 * Denne funktion virker uanset kontekst.
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
