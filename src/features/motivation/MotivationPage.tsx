import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { RollingText } from "../../components/RollingText";
import { SwipeToDelete } from "../../components/SwipeToDelete";
import { TextField } from "../../components/TextField";
import { IconChevronLeft, IconChevronRight, IconStar } from "../../components/icons";
import { createQuote, deleteQuote, listQuotes, setAllQuotesStarred, setQuoteStarred } from "../../db/quotes";
import { dayNumber, rotationOf } from "../../lib/quotes";
import type { Quote } from "../../types";

/**
 * Bladrer i alle citater og styrer rotationen: stjernede citater er dem, der vises på Oversigt og i
 * kalenderen (ingen stjernede = alle). Swipe til venstre sletter; man kan skrive sine egne.
 */
export function MotivationPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");

  async function reload() {
    setQuotes(await listQuotes());
  }

  useEffect(() => {
    void reload();
  }, []);

  const rotation = rotationOf(quotes);
  const todayQuote = rotation.length > 0 ? rotation[dayNumber() % rotation.length] : undefined;
  // Indtil man selv har bladret, viser kortet dagens citat.
  const shownIndex = index ?? (todayQuote ? quotes.indexOf(todayQuote) : 0);
  const shown = quotes[shownIndex];
  const allStarred = quotes.length > 0 && quotes.every((q) => q.starred);

  function step(delta: number) {
    setIndex((shownIndex + delta + quotes.length) % quotes.length);
  }

  function pick(i: number) {
    setIndex(i);
    document.getElementById("root")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleStar(quote: Quote) {
    await setQuoteStarred(quote.id, !quote.starred);
    await reload();
  }

  async function handleDelete(quote: Quote) {
    await deleteQuote(quote.id);
    // Hold det viste citat stabilt, når et andet forsvinder foran det i listen.
    if (index !== null && index >= quotes.length - 1) setIndex(Math.max(0, quotes.length - 2));
    await reload();
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    await createQuote(text);
    setDraft("");
    setIsAdding(false);
    setIndex(0); // nyeste ligger øverst
    await reload();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/dashboard-mountains.jpg" imagePosition="center 70%" />
      <h1 className="text-(--color-text)">Motivation</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border-accent) bg-(--color-surface) p-4 card-shadow">
        <span className="eyebrow text-(--color-accent-bright)">
          {shown && shown === todayQuote ? "Dagens citat" : `Citat ${shownIndex + 1} af ${quotes.length}`}
        </span>
        <RollingText
          text={shown?.text ?? ""}
          className="min-h-16 text-[24px] font-semibold leading-snug text-(--color-text)"
        />
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" aria-label="Forrige citat" onClick={() => step(-1)}>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => pick(Math.floor(Math.random() * quotes.length))}>
            Tilfældigt
          </Button>
          <Button variant="secondary" size="sm" aria-label="Næste citat" onClick={() => step(1)}>
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="section-title">Alle citater</h2>
          <span className="text-[12px] text-(--color-text-muted)">
            {rotation.length === quotes.length
              ? "Alle er i rotation"
              : `${rotation.length} af ${quotes.length} i rotation`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await setAllQuotesStarred(!allStarred);
              await reload();
            }}
          >
            {allStarred ? "Fravælg alle" : "Vælg alle"}
          </Button>
          <Button size="sm" variant={isAdding ? "secondary" : "primary"} onClick={() => setIsAdding((v) => !v)}>
            {isAdding ? "Annullér" : "Skriv dit eget"}
          </Button>
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-(--color-border-accent) bg-(--color-surface) p-4 card-shadow"
        >
          <TextField
            label="Dit citat"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Fx: Én gentagelse mere end i går."
            autoFocus
            maxLength={140}
          />
          <Button type="submit" disabled={!draft.trim()}>
            Tilføj til listen
          </Button>
        </form>
      )}

      <ul className="flex flex-col gap-2">
        {quotes.map((quote, i) => (
          <li key={quote.id}>
            <SwipeToDelete onDelete={() => void handleDelete(quote)} className="rounded-2xl">
              <div
                className={`flex items-center gap-2 rounded-2xl border bg-(--color-surface) py-3 pl-4 pr-2 card-shadow ${
                  i === shownIndex ? "border-(--color-border-accent)" : "border-(--color-border)"
                }`}
              >
                <button
                  type="button"
                  onClick={() => pick(i)}
                  className={`min-w-0 flex-1 text-left text-[15px] leading-snug active:opacity-70 ${
                    quote.starred ? "text-(--color-text)" : "text-(--color-text-muted)"
                  }`}
                >
                  “{quote.text}”
                </button>
                <button
                  type="button"
                  onClick={() => void toggleStar(quote)}
                  aria-label={quote.starred ? "Tag ud af rotationen" : "Sæt i rotationen"}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full active:opacity-60"
                >
                  <IconStar
                    className={`h-[18px] w-[18px] ${
                      quote.starred ? "text-(--color-cat-history)" : "text-(--color-text-muted)"
                    }`}
                    fill={quote.starred ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </SwipeToDelete>
          </li>
        ))}
      </ul>
    </div>
  );
}
