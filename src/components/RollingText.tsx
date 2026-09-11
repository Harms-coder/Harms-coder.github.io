import { useState } from "react";

interface RollingTextProps {
  text: string;
  className?: string;
}

/**
 * Tekst der "ruller", når den skifter: den gamle linje ruller op og ud, den nye ind nedefra.
 * Begge ligger i samme grid-celle, så beholderen er så høj som den højeste af de to, mens
 * de krydser hinanden — ingen absolut positionering og intet layout-hop midt i rullet.
 * Keyframes: .roll-in / .roll-out i index.css.
 */
export function RollingText({ text, className = "" }: RollingTextProps) {
  const [shown, setShown] = useState({ current: text, previous: null as string | null });

  // Ny tekst udefra: gem den gamle, så den kan rulle ud, mens den nye ruller ind.
  if (text !== shown.current) {
    setShown({ current: text, previous: shown.current });
  }

  return (
    <span className={`grid overflow-hidden ${className}`}>
      {shown.previous !== null && (
        <span
          key={`prev-${shown.previous}`}
          aria-hidden="true"
          className="roll-out col-start-1 row-start-1"
          onAnimationEnd={() => setShown((s) => ({ ...s, previous: null }))}
        >
          {shown.previous}
        </span>
      )}
      <span key={shown.current} className="roll-in col-start-1 row-start-1">
        {shown.current}
      </span>
    </span>
  );
}
