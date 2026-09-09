import type { Badge, BadgeKind } from "../lib/progressBadges";
import { IconCheck, IconFlame, IconTrendUp, IconTrophy, type IconComponent } from "./icons";

const ICONS: Record<BadgeKind, IconComponent> = {
  pr: IconTrophy,
  oneRm: IconTrophy,
  gain: IconTrendUp,
  streak: IconFlame,
  bestMonth: IconTrophy,
  goal: IconCheck,
};

export function ProgressBadge({ badge }: { badge: Badge }) {
  const Icon = ICONS[badge.kind];
  return (
    <span className="flex min-h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--color-border-accent) bg-(--color-surface-2) px-3.5 text-[12.5px] font-medium text-(--color-text)">
      <Icon className="h-3.5 w-3.5 text-(--color-accent-bright)" />
      {badge.label}
    </span>
  );
}
