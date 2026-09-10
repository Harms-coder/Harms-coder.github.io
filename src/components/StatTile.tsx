import { Link } from "react-router-dom";
import { IconChevronDown, type IconComponent } from "./icons";

interface StatTileProps {
  label: string;
  value: string;
  to?: string;
  icon?: IconComponent;
  /** Procentvis ændring vs. forrige periode. Udelades hvis der ikke er noget at sammenligne med. */
  delta?: number;
  /** Valgfri ekstra linje under tallet, fx en sjov sammenligning. */
  note?: string;
  className?: string;
}

export function StatTile({ label, value, to, icon: Icon, delta, note, className = "" }: StatTileProps) {
  const isPositive = (delta ?? 0) >= 0;
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-(--color-text-muted)">{label}</span>
        {Icon && (
          <span className="accent-fill flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
            <Icon className="h-[18px] w-[18px] text-(--color-text)" />
          </span>
        )}
      </div>
      <span className="text-[22px] font-bold text-(--color-text)">{value}</span>
      {delta !== undefined && (
        <span
          className={`flex items-center gap-0.5 text-[12px] font-semibold ${
            isPositive ? "text-(--color-success)" : "text-(--color-danger)"
          }`}
        >
          <IconChevronDown className={`h-3 w-3 ${isPositive ? "rotate-180" : ""}`} />
          {isPositive ? "+" : ""}
          {delta}%
        </span>
      )}
      {note && (
        <span className="text-right text-[15px] font-medium text-(--color-accent-glow)">
          {note}
        </span>
      )}
    </>
  );
  const sharedClassName = `flex flex-col gap-1 rounded-2xl border border-(--color-border-accent) bg-(--color-surface) p-4 card-shadow ${className}`;

  if (!to) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <Link to={to} className={`${sharedClassName} active:opacity-70`}>
      {content}
    </Link>
  );
}
