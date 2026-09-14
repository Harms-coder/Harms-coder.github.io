import type { MuscleLoad } from "../lib/muscleHeatmap";

/*
 * Skematisk krop, for- og bagside. Hvert felt er sin egen form, så det kan farves efter,
 * hvor hårdt kategorien er trænet. Bevidst forenklet frem for anatomisk: formålet er at se
 * skævheden på et halvt sekund, ikke at genkende en muskel.
 * viewBox 0 0 64 148 pr. figur; y=0 er toppen af hovedet.
 */

interface Region {
  /** Øvelseskategorien feltet hører til (EXERCISE_CATEGORIES). */
  category: string;
  /** Ellipse: cx, cy, rx, ry. Rotationen bruges til arme og lår. */
  e: [number, number, number, number];
  rotate?: number;
}

const FRONT: Region[] = [
  { category: "Skuldre", e: [20, 37, 6.5, 5.5] },
  { category: "Skuldre", e: [44, 37, 6.5, 5.5] },
  { category: "Bryst", e: [26, 49, 7, 7] },
  { category: "Bryst", e: [38, 49, 7, 7] },
  { category: "Mave", e: [32, 69, 7, 12] },
  { category: "Biceps", e: [10.5, 53, 4, 9] },
  { category: "Biceps", e: [53.5, 53, 4, 9] },
  { category: "Underarme", e: [10.5, 76, 3.5, 10] },
  { category: "Underarme", e: [53.5, 76, 3.5, 10] },
  { category: "Ben", e: [26, 104, 5.5, 16] },
  { category: "Ben", e: [38, 104, 5.5, 16] },
  { category: "Ben", e: [26, 131, 4.5, 11] },
  { category: "Ben", e: [38, 131, 4.5, 11] },
];

const BACK: Region[] = [
  { category: "Skuldre", e: [20, 37, 6.5, 5.5] },
  { category: "Skuldre", e: [44, 37, 6.5, 5.5] },
  { category: "Ryg", e: [32, 50, 12, 11] },
  { category: "Ryg", e: [32, 68, 8, 8] },
  { category: "Triceps", e: [10.5, 53, 4, 9] },
  { category: "Triceps", e: [53.5, 53, 4, 9] },
  { category: "Underarme", e: [10.5, 76, 3.5, 10] },
  { category: "Underarme", e: [53.5, 76, 3.5, 10] },
  { category: "Baller", e: [26, 89, 5.5, 7] },
  { category: "Baller", e: [38, 89, 5.5, 7] },
  { category: "Ben", e: [26, 110, 5.5, 14] },
  { category: "Ben", e: [38, 110, 5.5, 14] },
  { category: "Ben", e: [26, 133, 4.5, 10] },
  { category: "Ben", e: [38, 133, 4.5, 10] },
];

/** Helkrop hører ikke til ét felt — den lægges oven i de store grupper, så den ikke forsvinder. */
const FULL_BODY_SPREAD = ["Bryst", "Ryg", "Ben", "Baller"];
const FULL_BODY_SHARE = 0.5;

const EMPTY_FILL = "var(--color-surface-3)";

function fillFor(intensity: number): string {
  if (intensity <= 0.02) return EMPTY_FILL;
  /* Fra dæmpet til fuld kategorifarve — mint i bunden, guld i toppen, så det hårdest
     trænede felt skiller sig ud fra de mellemtrænede. */
  const base = intensity < 0.55 ? "var(--color-mint)" : "var(--color-gold-300)";
  const strength = Math.round(22 + intensity * 68);
  return `color-mix(in srgb, ${base} ${strength}%, var(--color-surface-3))`;
}

function Figure({
  regions,
  label,
  intensityFor,
}: {
  regions: Region[];
  label: string;
  intensityFor: (category: string) => number;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <svg viewBox="0 0 64 148" className="h-48 w-auto" role="img" aria-label={label}>
        {/*
         * Kroppen selv: hoved, krop, arme og ben i samme dæmpede farve som et utrænet felt,
         * så de felter, der ikke er trænet, forsvinder ind i figuren i stedet for at stå som
         * lyse pletter. Den tynde kant holder formen læsbar mod kortets baggrund.
         */}
        <g
          fill={EMPTY_FILL}
          stroke="var(--color-border-strong)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        >
          <circle cx="32" cy="13" r="9" />
          <rect x="29" y="21" width="6" height="8" rx="2.5" />
          <path d="M20 30h24a6 6 0 0 1 6 6l-3 32a5 5 0 0 1-5 4H22a5 5 0 0 1-5-4l-3-32a6 6 0 0 1 6-6Z" />
          <rect x="18" y="70" width="28" height="22" rx="8" />
          <rect x="6" y="36" width="9" height="52" rx="4.5" />
          <rect x="49" y="36" width="9" height="52" rx="4.5" />
          <rect x="20" y="88" width="11" height="58" rx="5" />
          <rect x="33" y="88" width="11" height="58" rx="5" />
        </g>
        {regions.map(({ category, e: [cx, cy, rx, ry], rotate }, i) => (
          <ellipse
            key={`${category}-${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={fillFor(intensityFor(category))}
            transform={rotate ? `rotate(${rotate} ${cx} ${cy})` : undefined}
          />
        ))}
      </svg>
      <span className="eyebrow text-(--color-text-muted)">{label}</span>
    </div>
  );
}

export function MuscleHeatmap({ loads }: { loads: Map<string, MuscleLoad> }) {
  function intensityFor(category: string): number {
    const own = loads.get(category)?.intensity ?? 0;
    const full = FULL_BODY_SPREAD.includes(category)
      ? (loads.get("Helkrop")?.intensity ?? 0) * FULL_BODY_SHARE
      : 0;
    return Math.min(1, own + full);
  }

  return (
    <div className="flex items-start gap-2">
      <Figure regions={FRONT} label="Forfra" intensityFor={intensityFor} />
      <Figure regions={BACK} label="Bagfra" intensityFor={intensityFor} />
    </div>
  );
}
