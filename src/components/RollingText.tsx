import { useLayoutEffect, useRef, useState } from "react";

interface RollingTextProps {
  text: string;
  className?: string;
}

// Samme kurve og lidt kortere end rullet (520 ms), så højden er på plads, før den gamle tekst fjernes.
const HEIGHT_EASE = "height 480ms cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Tekst der "ruller", når den skifter: den gamle linje ruller op og ud, den nye ind nedefra.
 * Begge ligger i samme grid-celle, klippet ved kanten, så det ligner et tælleværk.
 * Keyframes: .roll-in / .roll-out i index.css.
 *
 * Højden animeres med, når linjeantallet ændrer sig (fx to linjer → én). Uden det er
 * beholderen så høj som den højeste af de to tekster under rullet og hopper på plads bagefter.
 */
export function RollingText({ text, className = "" }: RollingTextProps) {
  const [shown, setShown] = useState({ current: text, previous: null as string | null });
  const ref = useRef<HTMLSpanElement>(null);
  const restingHeight = useRef(0);

  // Ny tekst udefra: gem den gamle, så den kan rulle ud, mens den nye ruller ind.
  if (text !== shown.current) {
    setShown({ current: text, previous: shown.current });
  }

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (shown.previous === null) {
      // I ro: auto-højde, så tekstombrydning ved fx rotation stadig virker. Husk højden til næste rul.
      el.style.transition = "";
      el.style.height = "";
      restingHeight.current = el.offsetHeight;
      return;
    }

    // Under rullet: lås højden på den gamle tekst, og lad den glide til den nyes (FLIP).
    const incoming = el.lastElementChild as HTMLElement;
    const from = restingHeight.current;
    const to = incoming.offsetHeight;
    if (from === to) return;
    el.style.transition = "none";
    el.style.height = `${from}px`;
    void el.offsetHeight; // tving layout, så overgangen har et startpunkt
    el.style.transition = HEIGHT_EASE;
    el.style.height = `${to}px`;
  }, [shown]);

  return (
    <span ref={ref} className={`grid overflow-hidden ${className}`}>
      {shown.previous !== null && (
        <span
          key={`prev-${shown.previous}`}
          aria-hidden="true"
          className="roll-out col-start-1 row-start-1 self-start"
          onAnimationEnd={() => setShown((s) => ({ ...s, previous: null }))}
        >
          {shown.previous}
        </span>
      )}
      <span key={shown.current} className="roll-in col-start-1 row-start-1 self-start">
        {shown.current}
      </span>
    </span>
  );
}
