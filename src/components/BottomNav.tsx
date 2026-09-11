import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from "react";
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

/** Bredde og placering af rulle-markøren, i procent af sporet. */
interface Thumb {
  width: number;
  left: number;
}

export function BottomNav() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb>({ width: 0, left: 0 });

  /*
   * Menuen kan scrolles vandret, men den indbyggede scrollbar er skjult (.no-scrollbar),
   * så der var intet der røbede at der lå flere faner. Markøren herunder viser både at
   * man kan rulle, og hvor i rækken man er. width 0 betyder "alt er synligt".
   */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const { scrollWidth, clientWidth, scrollLeft } = el;
      if (scrollWidth <= clientWidth + 1) {
        setThumb({ width: 0, left: 0 });
        return;
      }
      setThumb({
        width: (clientWidth / scrollWidth) * 100,
        left: (scrollLeft / scrollWidth) * 100,
      });
    };

    /*
     * Opdatér højst én gang pr. billede. Scroll-hændelser kan komme tættere end skærmen
     * opdaterer, og en React-render pr. hændelse ville hakke under momentum-scroll.
     */
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-bg-elevated)/95 backdrop-blur-md"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)" }}
    >
      <div className="flex items-stretch pt-2 pl-2">
        {/* Fastgjort uden for scroll-containeren, så Oversigt altid kan nås uanset hvor langt man har scrollet menuen. */}
        <NavItemLink item={homeItem} />
        <div className="mx-1 w-px flex-shrink-0 bg-(--color-border)" />
        <div
          ref={scrollerRef}
          className="no-scrollbar glow-scroller flex flex-1 items-center gap-1 overflow-x-auto pr-2"
        >
          {scrollableItems.map((item, i) => (
            <div key={item.to} className="flex items-center gap-1">
              {i > 0 && <span className="h-6 w-px flex-shrink-0 bg-(--color-border)" />}
              <NavItemLink item={item} />
            </div>
          ))}
        </div>
      </div>

      {thumb.width > 0 && (
        <div
          aria-hidden="true"
          className="mx-auto mt-1.5 h-[3px] w-28 overflow-hidden rounded-full bg-(--color-border-strong)"
        >
          <div
            className="h-full rounded-full bg-(--color-text-secondary)"
            style={{ width: `${thumb.width}%`, marginLeft: `${thumb.left}%` }}
          />
        </div>
      )}
    </nav>
  );
}
