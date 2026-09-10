import type { ReactNode } from "react";
import { VigorraLogo } from "./VigorraLogo";

interface HeroHeaderProps {
  title: string;
  subtitle: string;
  image: string;
  /** CSS object-position, til at style motivet rigtigt i den beskårede hero-bane. */
  imagePosition?: string;
  /** Valgfri knap ved siden af titlen, fx en "+ Tilføj"-handling. */
  action?: ReactNode;
  /** Tailwind-klasse for luften under subtitlen — mindre værdi flytter næste element tættere på. */
  bottomPadding?: string;
  /** Lille versal-tekst i højre side af hero'en, fx ["BEDRE VANER", "STÆRKERE DIG"]. */
  sideNote?: string[];
}

/** Genanvendelig hero-sektion: foto-baggrund med logo + titel + subtitle ovenpå, der blender ned i sidens baggrund. */
export function HeroHeader({
  title,
  subtitle,
  image,
  imagePosition = "center",
  action,
  bottomPadding = "pb-9",
  sideNote,
}: HeroHeaderProps) {
  return (
    <div className="hero-bleed relative -mx-4 overflow-hidden">
      <img
        src={image}
        alt=""
        className="image-fade-bottom absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div className="hero-scrim absolute inset-0" />
      <div
        className={`relative flex h-full flex-col justify-between px-4 ${bottomPadding}`}
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}
      >
        <VigorraLogo />
        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-(--color-text)">{title}</h1>
              {action}
            </div>
            <p className="text-[13px] text-(--color-text-secondary)">{subtitle}</p>
          </div>

          {sideNote && (
            <div className="flex flex-shrink-0 flex-col items-end gap-1 pb-1">
              {sideNote.map((line) => (
                <span
                  key={line}
                  className="eyebrow text-(--color-text-secondary)"
                >
                  {line}
                </span>
              ))}
              <span className="mt-0.5 h-px w-7 bg-(--color-accent)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
