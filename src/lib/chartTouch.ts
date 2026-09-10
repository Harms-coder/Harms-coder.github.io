import { useState } from "react";

/**
 * Recharts viser sin tooltip så længe den har en aktiv position. På en telefon betyder
 * det, at den bliver stående efter man har løftet fingeren, indtil man rammer noget andet.
 *
 * Hook'en holder styr på, om man er midt i en berøring, og lader kaldet tvinge tooltip'en
 * skjult, når fingeren slippes. Med mus sker der intet — der affyres ingen touch-hændelser,
 * så `active` forbliver undefined og Recharts styrer selv som før.
 */
export function useChartTouch() {
  const [released, setReleased] = useState(false);

  return {
    /** Læg på det element der omslutter diagrammet. */
    handlers: {
      onTouchStart: () => setReleased(false),
      onTouchEnd: () => setReleased(true),
      onTouchCancel: () => setReleased(true),
    },
    /** Gives til <Tooltip active={...}>. undefined = Recharts bestemmer selv. */
    tooltipActive: released ? (false as const) : undefined,
  };
}
