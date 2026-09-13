import logoMark from "../assets/logo-mark.png";

interface VigorraLogoProps {
  className?: string;
}

/** App-mærke: bladtekstureret trekant-mærke fra brand-arket + "VIGORRA"-ordmærke. Øverst på hero-sektioner. */
export function VigorraLogo({ className = "" }: VigorraLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt="" className="h-7 w-auto" draggable={false} />
      <span className="text-[18px] font-normal uppercase tracking-(--tracking-wordmark) text-(--color-text)">
        Vigorra
      </span>
    </div>
  );
}
