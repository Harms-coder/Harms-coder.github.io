import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconChevronDown, IconChevronRight, type IconComponent } from "./icons";

interface StatTileProps {
  label: string;
  value: string;
  to?: string;
  icon?: IconComponent;
  /** Kategorifarve på ikon-badgen, fx var(--color-cat-cardio). Default: styrke/orange. */
  accent?: string;
  /** Procentvis ændring vs. forrige periode. Udelades hvis der ikke er noget at sammenligne med. */
  delta?: number;
  /** Valgfri ekstra linje, fx en sjov sammenligning — vises til højre, adskilt af en lodret streg. */
  note?: ReactNode;
  /** Valgfri stregtegning ved siden af noten, fx en silhuet der matcher sammenligningen. */
  noteIllustration?: ReactNode;
  className?: string;
}

export function StatTile({
  label,
  value,
  to,
  icon: Icon,
  accent = "var(--color-cat-strength)",
  delta,
  note,
  noteIllustration,
  className = "",
}: StatTileProps) {
  const isPositive = (delta ?? 0) >= 0;

  const stats = (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[12.5px] font-medium text-(--color-text-muted)">{label}</span>
      <span className="text-[20px] font-bold leading-tight text-(--color-text)">{value}</span>
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
    </div>
  );

  const content = (
    <>
      {Icon && (
        <span
          className="cat-badge flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
          style={{ "--badge-color": accent } as CSSProperties}
        >
          <Icon className="h-[17px] w-[17px]" style={{ color: accent }} />
        </span>
      )}
      {stats}
      {note ? (
        <>
          <div className="h-10 w-px flex-shrink-0 bg-(--color-border)" />
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
            {noteIllustration}
            <span className="text-center text-[13px] font-medium text-(--color-accent-glow)">
              {note}
            </span>
          </div>
        </>
      ) : (
        <div className="flex-1" />
      )}
      {to && (
        <IconChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-(--color-text-muted)" />
      )}
    </>
  );

  const sharedClassName = `flex items-center gap-2.5 rounded-2xl border border-(--color-border-accent) bg-(--color-surface) p-4 card-shadow ${className}`;

  if (!to) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <Link to={to} className={`${sharedClassName} active:opacity-70`}>
      {content}
    </Link>
  );
}
