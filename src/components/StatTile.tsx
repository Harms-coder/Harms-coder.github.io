import { Link } from "react-router-dom";
import { IconChevronDown, type IconComponent } from "./icons";

interface StatTileProps {
  label: string;
  value: string;
  to?: string;
  icon?: IconComponent;
  /** Procentvis ændring vs. forrige periode. Udelades hvis der ikke er noget at sammenligne med. */
  delta?: number;
  className?: string;
}

export function StatTile({ label, value, to, icon: Icon, delta, className = "" }: StatTileProps) {
  const isPositive = (delta ?? 0) >= 0;
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-(--color-text-muted)">{label}</span>
        {Icon && (
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-(--color-surface-2)">
            <Icon className="h-3.5 w-3.5 text-(--color-accent-bright)" />
          </span>
        )}
      </div>
      <span className="text-[22px] font-semibold text-(--color-text)">{value}</span>
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
    </>
  );
  const sharedClassName = `flex flex-col gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow ${className}`;

  if (!to) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <Link to={to} className={`${sharedClassName} active:opacity-70`}>
      {content}
    </Link>
  );
}
