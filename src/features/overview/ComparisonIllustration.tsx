import { useState } from "react";
import type { ComparisonKind } from "../../lib/weightComparisons";
import { COMPARISON_PHOTOS } from "./comparisonPhotos";
import { COMPARISON_SILHOUETTES } from "./comparisonSilhouettes";

function Picture({ kind }: { kind: ComparisonKind }) {
  const photo = COMPARISON_PHOTOS[kind];
  if (photo) return <img src={photo} alt="" className="h-16 w-16 object-contain" />;

  const { fill, strokes } = COMPARISON_SILHOUETTES[kind];
  return (
    <svg viewBox="0 0 48 24" aria-hidden="true" className="h-10 w-20 text-(--color-accent-glow)">
      <path d={fill} fill="currentColor" fillRule="nonzero" />
      {strokes.map(([d, width]) => (
        <path key={d} d={d} fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function Row({ kinds }: { kinds: ComparisonKind[] }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {kinds.map((kind, i) => (
        <Picture key={`${kind}-${i}`} kind={kind} />
      ))}
    </div>
  );
}

/**
 * Billede(r) af det, vægten sammenlignes med — fx en giraf ved "2 giraffer", to billeder ved en
 * sammensætning. Skifter med samme rul som teksten (RollingText): det gamle billede glider op og
 * ud, mens det nye glider ind nedefra — før forsvandt det gamle bare. Rigtigt billede fra
 * src/assets/comparisons/, tegnet silhuet hvis der intet er.
 */
export function ComparisonIllustration({ kinds }: { kinds: ComparisonKind[] }) {
  const id = kinds.join("+");
  const [shown, setShown] = useState({ current: id, kinds, previous: null as ComparisonKind[] | null });

  if (id !== shown.current) {
    setShown({ current: id, kinds, previous: shown.kinds });
  }

  return (
    <div className="grid overflow-hidden">
      {shown.previous !== null && (
        <div
          key={`prev-${shown.current}`}
          aria-hidden="true"
          className="roll-out col-start-1 row-start-1"
          onAnimationEnd={() => setShown((s) => ({ ...s, previous: null }))}
        >
          <Row kinds={shown.previous} />
        </div>
      )}
      <div key={shown.current} className="roll-in col-start-1 row-start-1">
        <Row kinds={shown.kinds} />
      </div>
    </div>
  );
}
