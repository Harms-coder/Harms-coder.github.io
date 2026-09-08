interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <span className="text-[13px] font-medium text-(--color-text-muted)">{label}</span>
      <span className="text-[22px] font-semibold text-(--color-text)">{value}</span>
    </div>
  );
}
