import { Fragment, type CSSProperties } from "react";
import type { IconComponent } from "./icons";

export interface SummaryCell {
  icon: IconComponent;
  value: string;
  label: string;
  /** Kategorifarve på ikonet. Default: styrke/orange. */
  color?: string;
}

/**
 * Vandret opsummeringsrække med lodrette skillelinjer — bruges øverst på Historik og
 * Programmer. Rækken er tæt (op til 4 celler på 390px), så ikonerne står bare farvede
 * frem for i en badge, som på de større stat-fliser.
 */
export function SummaryRow({ cells }: { cells: SummaryCell[] }) {
  return (
    <div className="flex items-stretch justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      {cells.map((cell, i) => (
        <Fragment key={cell.label}>
          {i > 0 && <div className="w-px flex-shrink-0 bg-(--color-border)" />}
          <div
            className="flex flex-1 flex-col items-center gap-1 px-1"
            style={
              { "--badge-color": cell.color ?? "var(--color-cat-strength)" } as CSSProperties
            }
          >
            <cell.icon className="cat-glow h-4 w-4" />
            <span className="text-center text-[14px] font-bold leading-tight text-(--color-text)">
              {cell.value}
            </span>
            <span className="text-center text-[10.5px] leading-tight text-(--color-text-muted)">
              {cell.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
