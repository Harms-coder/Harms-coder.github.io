import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { TONE_COLORS } from "../../components/Button";
import { IconChevronRight, IconList, IconScale, IconTarget, type IconComponent } from "../../components/icons";

interface Entry {
  to: string;
  label: string;
  description: string;
  Icon: IconComponent;
  color: string;
}

/** De sider, der ikke fik plads i bundmenuen. Samme farver som deres egne sider. */
const ENTRIES: Entry[] = [
  { to: "/mal", label: "Mål", description: "Ugentlige mål, 1RM, kropsvægt og løb", Icon: IconTarget, color: TONE_COLORS.goal },
  { to: "/oevelser", label: "Øvelser", description: "Biblioteket med beskrivelser, favoritter og PR'er", Icon: IconList, color: TONE_COLORS.library },
  { to: "/kropsvaegt", label: "Kropsvægt", description: "Vejninger, udvikling og fremskrivning", Icon: IconScale, color: TONE_COLORS.body },
];

export function MorePage() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-(--color-text)">Mere</h1>
      <div className="flex flex-col gap-3">
        {ENTRIES.map(({ to, label, description, Icon, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow active:opacity-70"
          >
            <span
              className="cat-badge flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border"
              style={{ "--badge-color": color } as CSSProperties}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[15px] font-semibold text-(--color-text)">{label}</span>
              <span className="text-[12.5px] text-(--color-text-muted)">{description}</span>
            </span>
            <IconChevronRight className="h-4 w-4 flex-shrink-0 text-(--color-text-muted)" />
          </Link>
        ))}
      </div>
    </div>
  );
}
