import type { ComponentType, CSSProperties } from "react";
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
  /** Hvert punkt har sin egen farve, så fanerne kan kendes fra hinanden på farven alene. */
  color: string;
}

const navItems: NavItem[] = [
  { to: "/", label: "Oversigt", Icon: IconHome, color: "var(--color-cat-goal)" },
  { to: "/traening", label: "Træning", Icon: IconDumbbell, color: "var(--color-cat-strength)" },
  { to: "/cardio", label: "Cardio", Icon: IconActivity, color: "var(--color-cat-cardio)" },
  { to: "/progression", label: "Progression", Icon: IconTrendUp, color: "var(--color-cat-progress)" },
  { to: "/mal", label: "Mål", Icon: IconTarget, color: "var(--color-cat-record)" },
  { to: "/oevelser", label: "Øvelser", Icon: IconList, color: "var(--color-cat-library)" },
  { to: "/kalender", label: "Kalender", Icon: IconCalendar, color: "var(--color-cat-plan)" },
  { to: "/kropsvaegt", label: "Kropsvægt", Icon: IconScale, color: "var(--color-cat-body)" },
  { to: "/plan", label: "Programmer", Icon: IconClipboard, color: "var(--color-cat-plan)" },
  { to: "/historik", label: "Historik", Icon: IconClock, color: "var(--color-cat-history)" },
];

function NavItemLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      style={{ "--badge-color": item.color } as CSSProperties}
      className={({ isActive }) =>
        `flex min-w-16 flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
          isActive
            ? "cat-badge cat-glow border"
            : "border border-transparent text-(--color-text-muted) active:text-(--color-text)"
        }`
      }
    >
      <item.Icon className="h-5 w-5" />
      <span className="whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

const [homeItem, ...scrollableItems] = navItems;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-bg-elevated)/95 backdrop-blur-md">
      <div
        className="flex items-stretch pt-2 pl-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
      >
        {/* Fastgjort uden for scroll-containeren, så Oversigt altid kan nås uanset hvor langt man har scrollet menuen. */}
        <NavItemLink item={homeItem} />
        <div className="mx-1 w-px flex-shrink-0 bg-(--color-border)" />
        <div className="no-scrollbar flex flex-1 items-center gap-1 overflow-x-auto pr-2">
          {scrollableItems.map((item, i) => (
            <div key={item.to} className="flex items-center gap-1">
              {i > 0 && <span className="h-6 w-px flex-shrink-0 bg-(--color-border)" />}
              <NavItemLink item={item} />
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
