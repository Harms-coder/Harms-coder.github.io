import { NavLink } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: "/", label: "Oversigt", icon: "◎" },
  { to: "/traening", label: "Træning", icon: "🏋" },
  { to: "/cardio", label: "Cardio", icon: "🏃" },
  { to: "/progression", label: "Progression", icon: "📈" },
  { to: "/oevelser", label: "Øvelser", icon: "📋" },
  { to: "/kalender", label: "Kalender", icon: "📅" },
  { to: "/historik", label: "Historik", icon: "🕓" },
  { to: "/kropsvaegt", label: "Kropsvægt", icon: "⚖" },
  { to: "/plan", label: "Min Plan", icon: "📝" },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-bg-elevated)/95 backdrop-blur-md">
      <div
        className="no-scrollbar flex gap-1 overflow-x-auto px-2 pt-2"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex min-w-16 flex-shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-(--color-accent)"
                  : "text-(--color-text-muted) active:text-(--color-text)"
              }`
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
