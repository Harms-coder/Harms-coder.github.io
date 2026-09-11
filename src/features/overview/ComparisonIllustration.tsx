import type { ComparisonKind } from "../../lib/weightComparisons";
import { COMPARISON_SILHOUETTES } from "./comparisonSilhouettes";

/** Udfyldt silhuet af det, vægten sammenlignes med — fx et næsehorn ved "2 næsehorn". */
export function ComparisonIllustration({ kind }: { kind: ComparisonKind }) {
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
