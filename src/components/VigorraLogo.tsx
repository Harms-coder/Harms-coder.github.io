import logoMark from "../assets/logo-mark.png";
import wordmark from "../assets/wordmark.png";

interface VigorraLogoProps {
  className?: string;
}

/** App-mærke: bladtekstureret trekant-mærke + ordmærke, begge fra brand-arket. Øverst på hero-sektioner. */
export function VigorraLogo({ className = "" }: VigorraLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img src={logoMark} alt="" className="h-7 w-auto" draggable={false} />
      {/* Ordmærket er arkets egen skrift, klippet ud og gjort hvidt — ingen font kan ramme A'et uden tværstreg. */}
      <img src={wordmark} alt="Vigorra" className="h-[13px] w-auto" draggable={false} />
    </div>
  );
}
