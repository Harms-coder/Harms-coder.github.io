import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties, type MouseEvent } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRotation } from "../features/motivation/useRotation";
import { QuoteTicker } from "./QuoteTicker";
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

/** Den lille bevægelse ikonet laver, når fanen vælges — keyframes i index.css (.nav-icon-*). */
type IconAnim = "bounce" | "spin" | "draw" | "rise" | "sweep";

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  /** Hvert punkt har sin egen farve, så fanerne kan kendes fra hinanden på farven alene. */
  color: string;
  anim: IconAnim;
}

const navItems: NavItem[] = [
  { to: "/", label: "Oversigt", Icon: IconHome, color: "var(--color-cat-goal)", anim: "bounce" },
  { to: "/traening", label: "Træning", Icon: IconDumbbell, color: "var(--color-cat-strength)", anim: "spin" },
  { to: "/cardio", label: "Cardio", Icon: IconActivity, color: "var(--color-cat-cardio)", anim: "draw" },
  { to: "/progression", label: "Progression", Icon: IconTrendUp, color: "var(--color-cat-progress)", anim: "rise" },
  { to: "/mal", label: "Mål", Icon: IconTarget, color: "var(--color-cat-record)", anim: "bounce" },
  { to: "/oevelser", label: "Øvelser", Icon: IconList, color: "var(--color-cat-library)", anim: "bounce" },
  { to: "/kalender", label: "Kalender", Icon: IconCalendar, color: "var(--color-cat-plan)", anim: "bounce" },
  { to: "/kropsvaegt", label: "Kropsvægt", Icon: IconScale, color: "var(--color-cat-body)", anim: "bounce" },
  { to: "/plan", label: "Programmer", Icon: IconClipboard, color: "var(--color-cat-plan)", anim: "bounce" },
  { to: "/historik", label: "Historik", Icon: IconClock, color: "var(--color-cat-history)", anim: "sweep" },
];

function NavItemLink({ item, onSelect }: { item: NavItem; onSelect: (to: string) => void }) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSelect(item.to);
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onClick}
      style={{ "--badge-color": item.color } as CSSProperties}
      className={({ isActive }) =>
        `relative flex min-w-16 flex-shrink-0 flex-col items-center gap-1 border border-transparent px-3 py-1.5 text-[11px] font-medium transition-colors ${
          isActive ? "cat-glow" : "text-(--color-text-muted) active:text-(--color-text)"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Pillen er sit eget element, så det kun er den — ikke ikon og tekst — der glider med. */}
          {isActive && (
            <span
              aria-hidden="true"
              className="cat-badge absolute inset-0 rounded-xl border"
              style={{ viewTransitionName: "nav-pill" }}
            />
          )}
          <item.Icon className={`relative h-5 w-5 ${isActive ? `nav-icon-${item.anim}` : ""}`} />
          <span className="relative whitespace-nowrap">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

const [homeItem, ...scrollableItems] = navItems;

/** Bredde og placering af rulle-markøren, i procent af sporet. */
interface Thumb {
  width: number;
  left: number;
}

/**
 * Navigerer inde i en View Transition, så browseren selv animerer den aktive pille (den eneste
 * med view-transition-name) fra den gamle fane til den nye. React Router v7 pakker navigationen i
 * React.startTransition, så DOM'en er IKKE opdateret, når navigate() returnerer — derfor venter
 * callbacket på et promise, der først opfyldes når den nye rute er committet (layout-effekten
 * herunder). Uden det tager Safari "efter"-billedet for tidligt og opgiver transitionen.
 * React Routers egen viewTransition-prop virker kun med data-routers, ikke <BrowserRouter>.
 */
function useNavigateWithTransition() {
  const navigate = useNavigate();
  const location = useLocation();
  const committedRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    committedRef.current?.();
    committedRef.current = null;
  }, [location]);

  return (to: string) => {
    if (to === location.pathname || !document.startViewTransition) {
      navigate(to);
      return;
    }
    document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          committedRef.current = resolve;
          // ponytail: sikkerhedsnet — hænger React (fx en langsom lazy-side), fryser siden ikke.
          setTimeout(resolve, 500);
          navigate(to);
        }),
    );
  };
}

export function BottomNav() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb>({ width: 0, left: 0 });
  const select = useNavigateWithTransition();
  const { rotation } = useRotation();

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
      /*
       * Rulleteksten bor i den luft, der før var polstring: safe-area + 8 px er blevet til
       * 4 px + 20 px tekst + (safe-area − 16 px). Samme totalhøjde på telefonen, så menuen flytter sig ikke.
       */
      style={{ paddingBottom: "max(0.25rem, calc(env(safe-area-inset-bottom, 0px) - 1rem))" }}
    >
      <div className="flex items-stretch pt-2 pl-2">
        {/* Fastgjort uden for scroll-containeren, så Oversigt altid kan nås uanset hvor langt man har scrollet menuen. */}
        <NavItemLink item={homeItem} onSelect={select} />
        <div className="mx-1 w-px flex-shrink-0 bg-(--color-border)" />
        <div
          ref={scrollerRef}
          className="no-scrollbar glow-scroller flex flex-1 items-center gap-1 overflow-x-auto pr-2"
        >
          {scrollableItems.map((item, i) => (
            <div key={item.to} className="flex items-center gap-1">
              {i > 0 && <span className="h-6 w-px flex-shrink-0 bg-(--color-border)" />}
              <NavItemLink item={item} onSelect={select} />
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
      <div className="mt-1">
        <QuoteTicker quotes={rotation.map((q) => q.text)} />
      </div>
    </nav>
  );
}
