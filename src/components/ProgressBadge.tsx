import { Link } from "react-router-dom";
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

const className =
  "flex min-h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--color-border-accent) bg-(--color-surface-2) px-3.5 text-[12.5px] font-medium text-(--color-text)";

export function ProgressBadge({ badge }: { badge: Badge }) {
  const Icon = ICONS[badge.kind];
  const content = (
    <>
      <Icon className="h-3.5 w-3.5 text-(--color-accent-bright)" />
      {badge.label}
    </>
  );

  if (badge.exerciseIds && badge.exerciseIds.length > 0) {
    const to =
      badge.exerciseIds.length === 1 ? `/oevelser/${badge.exerciseIds[0]}` : "/oevelser";
    return (
      <Link
        to={to}
        state={badge.exerciseIds.length > 1 ? { filterIds: badge.exerciseIds } : undefined}
        className={className}
      >
        {content}
      </Link>
    );
  }

  if (badge.linkTo) {
    return (
      <Link to={badge.linkTo} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}
