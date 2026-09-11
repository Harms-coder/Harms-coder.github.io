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

/**
 * Billede(r) af det, vægten sammenlignes med — fx en giraf ved "2 giraffer", to billeder ved en
 * sammensætning. Ruller ind nedefra, når sammenligningen skifter (key på kaldet gør, at den
 * genmonteres). Rigtigt billede fra src/assets/comparisons/, tegnet silhuet hvis der intet er.
 */
export function ComparisonIllustration({ kinds }: { kinds: ComparisonKind[] }) {
  return (
    <div className="overflow-hidden">
      <div className="roll-in flex items-center justify-center gap-1">
        {kinds.map((kind, i) => (
          <Picture key={`${kind}-${i}`} kind={kind} />
        ))}
      </div>
    </div>
  );
}
