interface QuoteTickerProps {
  quotes: string[];
}

/**
 * Vandret rulletekst med citaterne i rotation — sidder i bundmenuens luft over hjemmeindikatoren.
 * Klassisk sømløs marquee: samme linje to gange, sporet flyttes én linjes bredde og starter forfra.
 * Hastigheden følger tekstlængden, så en enkelt kort linje ikke suser forbi (.ticker-track i index.css).
 */
export function QuoteTicker({ quotes }: QuoteTickerProps) {
  // Fast højde også uden citater, så menuen ikke hopper, mens databasen læses.
  if (quotes.length === 0) return <div className="h-4" />;

  const line = quotes.map((q) => `“${q}”`).join("   ·   ");
  // ponytail: ~0.16 s pr. tegn ≈ 35 px/s ved 11 px — mål bredden, hvis tempoet skal være eksakt.
  const seconds = Math.max(20, Math.round(line.length * 0.16));

  return (
    <div aria-hidden="true" className="ticker h-4 overflow-hidden text-[11px] leading-4 text-(--color-text-muted)">
      <div className="ticker-track" style={{ animationDuration: `${seconds}s` }}>
        <span>{line}</span>
        <span>{line}</span>
      </div>
    </div>
  );
}
