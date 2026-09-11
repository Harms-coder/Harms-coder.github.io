import type { ComparisonKind } from "../../lib/weightComparisons";
import { COMPARISON_PHOTOS } from "./comparisonPhotos";
import { COMPARISON_SILHOUETTES } from "./comparisonSilhouettes";

/** Billede af det, vægten sammenlignes med — fx en giraf ved "2 giraffer"; tegnet silhuet, hvis der intet billede er. */
export function ComparisonIllustration({ kind }: { kind: ComparisonKind }) {
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
