import type { CSSProperties } from "react";
import type { IconComponent } from "./icons";

interface MetricCardProps {
  icon: IconComponent;
  value: string;
  label: string;
  /** Kategorifarve på ikon-badgen, fx var(--color-cat-cardio). Default: styrke/orange. */
  accent?: string;
}

/** Kompakt, centreret stat-kort (ikon, stort tal, label) — bruges i rækker af 3, fx Cardio-statistikker. */
export function MetricCard({
  icon: Icon,
  value,
  label,
  accent = "var(--color-cat-strength)",
}: MetricCardProps) {
  return (
    <div className="flex min-h-28 flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3.5 card-shadow">
      <span
        className="cat-badge flex h-9 w-9 items-center justify-center rounded-full border"
        style={{ "--badge-color": accent } as CSSProperties}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </span>
      <span className="text-[17px] font-semibold text-(--color-text)">{value}</span>
      <span className="text-center text-[11px] text-(--color-text-muted)">{label}</span>
    </div>
  );
}
