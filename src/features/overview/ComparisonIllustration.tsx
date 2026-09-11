import { useState } from "react";
import type { ComparisonKind } from "../../lib/weightComparisons";
import { COMPARISON_SILHOUETTES } from "./comparisonSilhouettes";

/**
 * Billede af det, vægten sammenlignes med — fx en giraf ved "2 giraffer". Prøver først et rigtigt
 * billede fra public/images/comparisons/<kind>.png (samme mønster som øvelsesbillederne) og falder
 * tilbage til den tegnede silhuet, hvis der ikke er lagt et billede ind for den ting endnu.
 */
export function ComparisonIllustration({ kind }: { kind: ComparisonKind }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  if (!photoFailed) {
    return (
      <img
        src={`/images/comparisons/${kind}.png`}
        alt=""
        className="h-16 w-16 object-contain"
        onError={() => setPhotoFailed(true)}
      />
    );
  }

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
