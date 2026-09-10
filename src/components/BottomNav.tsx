import type { ComponentType } from "react";
import { NavLink } from "react-router-dom";
import {
  IconActivity,
  IconCalendar,
  IconClipboard,
  IconClock,
  IconDumbbell,
  IconHome,
  IconList,
  IconScale,
  IconTarget,
  IconTrendUp,
} from "./icons";

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { to: "/", label: "Oversigt", Icon: IconHome },
  { to: "/traening", label: "Træning", Icon: IconDumbbell },
  { to: "/cardio", label: "Cardio", Icon: IconActivity },
  { to: "/progression", label: "Progression", Icon: IconTrendUp },
  { to: "/mal", label: "Mål", Icon: IconTarget },
  { to: "/oevelser", label: "Øvelser", Icon: IconList },
  { to: "/kalender", label: "Kalender", Icon: IconCalendar },
  { to: "/kropsvaegt", label: "Kropsvægt", Icon: IconScale },
  { to: "/plan", label: "Min Plan", Icon: IconClipboard },
  { to: "/historik", label: "Historik", Icon: IconClock },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-16 flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
    isActive
      ? "text-(--color-accent-bright) [&>svg]:drop-shadow-[0_0_6px_var(--color-glow)]"
      : "text-(--color-text-muted) active:text-(--color-text)"
  }`;

const [homeItem, ...scrollableItems] = navItems;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-bg-elevated)/95 backdrop-blur-md">
      <div
        className="flex items-stretch pt-2 pl-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
      >
        {/* Fastgjort uden for scroll-containeren, så Oversigt altid kan nås uanset hvor langt man har scrollet menuen. */}
        <NavLink to={homeItem.to} end className={linkClassName}>
          <homeItem.Icon className="h-5 w-5" />
          <span className="whitespace-nowrap">{homeItem.label}</span>
        </NavLink>
        <div className="mx-1 w-px flex-shrink-0 bg-(--color-border)" />
        <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto pr-2">
          {scrollableItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClassName}>
              <item.Icon className="h-5 w-5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
