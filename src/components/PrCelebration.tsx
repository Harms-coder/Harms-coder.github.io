import { useEffect, useState } from "react";
import { IconTrophy } from "./icons";

/* Faste værdier pr. konfetti-stykke: retning, fald, drejning, farve og forsinkelse.
   Hårdkodet frem for Math.random(), så fejringen ser ens ud hver gang og ikke kan ramme et kedeligt kast. */
const CONFETTI = [
  { x: -150, y: 150, rotate: 320, delay: 0, color: "var(--color-gold-300)" },
  { x: -110, y: 250, rotate: -280, delay: 60, color: "var(--color-mint)" },
  { x: -70, y: 120, rotate: 200, delay: 20, color: "var(--color-gold-100)" },
  { x: -40, y: 300, rotate: -360, delay: 100, color: "var(--color-gold-500)" },
  { x: -15, y: 190, rotate: 260, delay: 0, color: "var(--color-mint)" },
  { x: 15, y: 260, rotate: -220, delay: 80, color: "var(--color-gold-300)" },
  { x: 45, y: 140, rotate: 340, delay: 40, color: "var(--color-gold-100)" },
  { x: 80, y: 280, rotate: -300, delay: 120, color: "var(--color-mint)" },
  { x: 115, y: 170, rotate: 240, delay: 20, color: "var(--color-gold-500)" },
  { x: 155, y: 230, rotate: -340, delay: 90, color: "var(--color-gold-300)" },
  { x: -90, y: 330, rotate: 180, delay: 150, color: "var(--color-gold-100)" },
  { x: 95, y: 350, rotate: -190, delay: 140, color: "var(--color-mint)" },
];

const DURATION_MS = 2000;

interface PrCelebrationProps {
  /** Tælleren tændes: hver gang tallet stiger, kører fejringen én gang. 0 = intet vist endnu. */
  signal: number;
  /** Fx "127,5 kg × 7" — vises under overskriften. */
  detail?: string;
}

/**
 * Fejring når et sæt slår øvelsens rekord: guld-glød, konfetti og et pokal-banner.
 * Ligger som et lag over siden og lukker sig selv. Bevidst ikke gated på prefers-reduced-motion —
 * telefonen kører med Reducér bevægelse slået til, og så ville fejringen aldrig blive set.
 */
export function PrCelebration({ signal, detail }: PrCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (signal === 0) return;
    setVisible(true);
    const id = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(id);
  }, [signal]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <div className="pr-flash absolute inset-0" />
      <div className="relative flex flex-col items-center gap-1">
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            className="pr-confetti absolute h-2.5 w-1.5 rounded-[1px]"
            style={{
              background: piece.color,
              animationDelay: `${piece.delay}ms`,
              ["--pr-x" as string]: `${piece.x}px`,
              ["--pr-y" as string]: `${piece.y}px`,
              ["--pr-rotate" as string]: `${piece.rotate}deg`,
            }}
          />
        ))}
        <div className="pr-banner flex flex-col items-center gap-1.5 rounded-2xl border border-(--color-border-gold) bg-(--color-surface) px-6 py-4 card-shadow">
          <IconTrophy className="h-8 w-8 text-(--color-cat-record)" />
          <span className="text-[19px] font-bold tracking-[0.12em] text-(--color-cat-record)">
            NY REKORD
          </span>
          {detail && <span className="text-[14px] text-(--color-text-secondary)">{detail}</span>}
        </div>
      </div>
    </div>
  );
}
