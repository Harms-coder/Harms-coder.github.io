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

/** Hver badge-type har sin egen kategorifarve, så betydningen kan aflæses på farven alene. */
const BADGE_COLORS: Record<BadgeKind, string> = {
  pr: "var(--color-cat-strength)",
  oneRm: "var(--color-cat-record)",
  gain: "var(--color-cat-progress)",
  streak: "var(--color-cat-strength)",
  bestMonth: "var(--color-cat-goal)",
  goal: "var(--color-cat-progress)",
};

const className =
  "flex min-h-9 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-[12.5px] font-medium text-(--color-text)";

export function ProgressBadge({ badge }: { badge: Badge }) {
  const Icon = ICONS[badge.kind];
  const style = { "--badge-color": BADGE_COLORS[badge.kind] } as React.CSSProperties;
  const content = (
    <>
      <Icon className="h-3.5 w-3.5" style={{ color: BADGE_COLORS[badge.kind] }} />
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
        className={`cat-badge ${className}`}
        style={style}
      >
        {content}
      </Link>
    );
  }

  if (badge.linkTo) {
    return (
      <Link to={badge.linkTo} className={`cat-badge ${className}`} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <span className={`cat-badge ${className}`} style={style}>
      {content}
    </span>
  );
}
