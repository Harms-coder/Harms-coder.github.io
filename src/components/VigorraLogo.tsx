interface VigorraLogoProps {
  className?: string;
}

/** App-mærke: en stiliseret bjerg-/V-form + "VIGORRA"-ordmærke. Genbruges øverst på hero-sektioner. */
export function VigorraLogo({ className = "" }: VigorraLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="vigorraMark" x1="6" y1="5" x2="27" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-accent-glow)" />
            <stop offset="100%" stopColor="var(--color-accent-dark)" />
          </linearGradient>
          <filter id="vigorraGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path d="M11 7 L20 27 H2 Z" fill="var(--color-accent-dark)" opacity="0.55" />
        <path d="M18 3 L30 27 H6 Z" fill="url(#vigorraMark)" filter="url(#vigorraGlow)" />
        <path d="M18 3 L18 27" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      </svg>
      <span className="text-[17px] font-semibold uppercase tracking-(--tracking-wordmark) text-(--color-text)">
        Vigorra
      </span>
    </div>
  );
}
