import { VigorraLogo } from "./VigorraLogo";

interface HeroHeaderProps {
  title: string;
  subtitle: string;
  image: string;
  /** CSS object-position, til at style motivet rigtigt i den beskårede hero-bane. */
  imagePosition?: string;
}

/** Genanvendelig hero-sektion: foto-baggrund med logo + titel + subtitle ovenpå, der blender ned i sidens baggrund. */
export function HeroHeader({ title, subtitle, image, imagePosition = "center" }: HeroHeaderProps) {
  return (
    <div className="relative -mx-4 -mt-6 h-72 overflow-hidden">
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: imagePosition }}
      />
      <div className="hero-scrim absolute inset-0" />
      <div
        className="relative flex h-full flex-col justify-between px-4 pb-9"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)" }}
      >
        <VigorraLogo />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[30px] font-bold tracking-tight text-(--color-text)">{title}</h1>
          <p className="text-[13px] text-(--color-text-secondary)">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
