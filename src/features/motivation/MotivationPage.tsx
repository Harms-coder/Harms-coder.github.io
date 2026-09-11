import { useState } from "react";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { RollingText } from "../../components/RollingText";
import { IconChevronLeft, IconChevronRight } from "../../components/icons";
import { QUOTES, quoteIndexForToday } from "../../lib/quotes";

/** Bladrer i alle citater. Nås fra Motivation-boksen på Oversigt. */
export function MotivationPage() {
  const [index, setIndex] = useState(quoteIndexForToday);
  const isToday = index === quoteIndexForToday();

  function step(delta: number) {
    setIndex((i) => (i + delta + QUOTES.length) % QUOTES.length);
  }

  function pick(i: number) {
    setIndex(i);
    document.getElementById("root")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/dashboard-mountains.jpg" imagePosition="center 70%" />
      <h1 className="text-(--color-text)">Motivation</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border-accent) bg-(--color-surface) p-4 card-shadow">
        <span className="eyebrow text-(--color-accent-bright)">
          {isToday ? "Dagens citat" : `Citat ${index + 1} af ${QUOTES.length}`}
        </span>
        <RollingText
          text={QUOTES[index]}
          className="min-h-16 text-[24px] font-semibold leading-snug text-(--color-text)"
        />
        <div className="flex items-center justify-between gap-2">
          <Button variant="secondary" size="sm" aria-label="Forrige citat" onClick={() => step(-1)}>
            <IconChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => pick(Math.floor(Math.random() * QUOTES.length))}>
            Tilfældigt
          </Button>
          <Button variant="secondary" size="sm" aria-label="Næste citat" onClick={() => step(1)}>
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h2 className="mt-2 text-[15px] font-semibold text-(--color-text)">Alle citater</h2>
      <ul className="flex flex-col gap-2">
        {QUOTES.map((quote, i) => (
          <li key={quote}>
            <button
              type="button"
              onClick={() => pick(i)}
              className={`w-full rounded-2xl border bg-(--color-surface) p-4 text-left text-[15px] leading-snug card-shadow active:opacity-80 ${
                i === index
                  ? "border-(--color-border-accent) text-(--color-text)"
                  : "border-(--color-border) text-(--color-text-secondary)"
              }`}
            >
              “{quote}”
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
