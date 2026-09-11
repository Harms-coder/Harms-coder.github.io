interface QuoteTickerProps {
  quotes: string[];
}

/**
 * Vandret rulletekst med citaterne i rotation — sidder i bundmenuens luft over hjemmeindikatoren.
 * Klassisk sømløs marquee: samme række to gange, sporet flyttes én rækkes bredde og starter forfra.
 * Citaterne adskilles kun af luft (ingen tegn imellem — det så rodet ud).
 * Hastigheden følger tekstlængden, så en enkelt kort linje ikke suser forbi (.ticker-track i index.css).
 */
export function QuoteTicker({ quotes }: QuoteTickerProps) {
  // Fast højde også uden citater, så menuen ikke hopper, mens databasen læses.
  if (quotes.length === 0) return <div className="h-5" />;

  // ponytail: ~0.16 s pr. tegn ≈ 40 px/s ved 13 px, plus luften mellem citaterne — mål bredden, hvis tempoet skal være eksakt.
  const chars = quotes.reduce((sum, q) => sum + q.length, 0) + quotes.length * 12;
  const seconds = Math.max(20, Math.round(chars * 0.16));

  return (
    <div aria-hidden="true" className="ticker h-5 overflow-hidden text-[13px] leading-5 text-(--color-text-muted)">
      <div className="ticker-track" style={{ animationDuration: `${seconds}s` }}>
        {[0, 1].map((copy) => (
          <span key={copy} className="ticker-copy">
            {quotes.map((quote, i) => (
              <span key={i}>{quote}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
