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
  /** Tailwind højde-klasse for hero-banen. Default h-72. */
  height?: string;
  /** Sløre billedet let, til motiver der ellers virker for skarpe/dominerende (fx nærbilleder af udstyr). */
  imageBlur?: boolean;
}

/** Genanvendelig hero-sektion: foto-baggrund med logo + titel + subtitle ovenpå, der blender ned i sidens baggrund. */
export function HeroHeader({
  title,
  subtitle,
  image,
  imagePosition = "center",
  action,
  bottomPadding = "pb-9",
  height = "h-72",
  imageBlur = false,
}: HeroHeaderProps) {
  return (
    <div className={`relative -mx-4 -mt-6 ${height} overflow-hidden`}>
      <img
        src={image}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${imageBlur ? "scale-110 blur-sm" : ""}`}
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
