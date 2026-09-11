import { generateId } from "../lib/id";
import { DEFAULT_QUOTES } from "../lib/quotes";
import type { Quote } from "../types";
import { getDb } from "./database";

const SEED_FLAG_KEY = "traeningsapp:default-quotes-seeded";

/** Nyeste først, så et citat man lige har skrevet, står øverst. */
export async function listQuotes(): Promise<Quote[]> {
  const db = await getDb();
  const all = await db.getAll("quotes");
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createQuote(text: string): Promise<Quote> {
  const db = await getDb();
  const quote: Quote = { id: generateId(), text: text.trim(), starred: true, createdAt: new Date().toISOString() };
  await db.add("quotes", quote);
  return quote;
}

export async function setQuoteStarred(id: string, starred: boolean): Promise<void> {
  const db = await getDb();
  const existing = await db.get("quotes", id);
  if (!existing) throw new Error("Citat findes ikke");
  await db.put("quotes", { ...existing, starred });
}

export async function setAllQuotesStarred(starred: boolean): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("quotes", "readwrite");
  const all = await tx.store.getAll();
  await Promise.all([...all.map((q) => tx.store.put({ ...q, starred })), tx.done]);
}

export async function deleteQuote(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("quotes", id);
}

/**
 * Lægger standardcitaterne ind første gang — samme model som øvelsesbiblioteket: et flag i
 * localStorage, ikke "lageret er tomt", så sletter man alle citater, kommer de ikke igen.
 * createdAt falder ét ms pr. citat, så listen (nyeste først) beholder rækkefølgen fra DEFAULT_QUOTES.
 */
export async function seedDefaultQuotesIfNeeded(): Promise<void> {
  if (typeof localStorage !== "undefined" && localStorage.getItem(SEED_FLAG_KEY)) return;
  const db = await getDb();
  if ((await db.count("quotes")) === 0) {
    const tx = db.transaction("quotes", "readwrite");
    const base = Date.now();
    await Promise.all([
      ...DEFAULT_QUOTES.map((text, i) =>
        tx.store.add({ id: generateId(), text, starred: true, createdAt: new Date(base - i).toISOString() }),
      ),
      tx.done,
    ]);
  }
  if (typeof localStorage !== "undefined") localStorage.setItem(SEED_FLAG_KEY, "1");
}

/** Bruges når alt slettes, så standardcitaterne kommer igen ved næste åbning. */
export function forgetQuoteSeedFlag(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(SEED_FLAG_KEY);
}
