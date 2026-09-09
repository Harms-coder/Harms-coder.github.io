import type { IconComponent } from "./icons";

interface MetricCardProps {
  icon: IconComponent;
  value: string;
  label: string;
}

/** Kompakt, centreret stat-kort (ikon, stort tal, label) — bruges i rækker af 3, fx Cardio-statistikker. */
export function MetricCard({ icon: Icon, value, label }: MetricCardProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-3.5 card-shadow">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-2)">
        <Icon className="h-4 w-4 text-(--color-accent-bright)" />
      </span>
      <span className="text-[17px] font-semibold text-(--color-text)">{value}</span>
      <span className="text-center text-[11px] text-(--color-text-muted)">{label}</span>
    </div>
  );
}
