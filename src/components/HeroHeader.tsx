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
}

/** Genanvendelig hero-sektion: foto-baggrund med logo + titel + subtitle ovenpå, der blender ned i sidens baggrund. */
export function HeroHeader({
  title,
  subtitle,
  image,
  imagePosition = "center",
  action,
  bottomPadding = "pb-9",
}: HeroHeaderProps) {
  return (
    <div className="relative -mx-4 -mt-6 h-72 overflow-hidden">
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
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-[30px] font-bold tracking-tight text-(--color-text)">{title}</h1>
            {action}
          </div>
          <p className="text-[13px] text-(--color-text-secondary)">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
