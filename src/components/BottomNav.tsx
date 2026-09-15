import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useRotation } from "../features/motivation/useRotation";
import { QuoteTicker } from "./QuoteTicker";
import {
  IconActivity,
  IconCalendarToday,
  IconClipboard,
  IconClock,
  IconDumbbell,
  IconHome,
  IconMore,
  IconTrendUp,
} from "./icons";

/** Den lille bevægelse ikonet laver, når fanen vælges — keyframes i index.css (.nav-icon-*). */
type IconAnim =
  | "bounce"
  | "spin"
  | "draw"
  | "fly"
  | "sweep"
  | "hoplines"
  | "tear"
  | "write"
  | "pop"
  | "swing";

interface NavItem {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  anim: IconAnim;
  /** Andre ruter, der også tæller som "denne fane" (Mere samler flere sider). */
  also?: string[];
}

const navItems: NavItem[] = [
  { to: "/", label: "Oversigt", Icon: IconHome, anim: "bounce" },
  { to: "/traening", label: "Træning", Icon: IconDumbbell, anim: "spin" },
  { to: "/cardio", label: "Cardio", Icon: IconActivity, anim: "draw" },
  { to: "/progression", label: "Progression", Icon: IconTrendUp, anim: "fly" },
  { to: "/kalender", label: "Kalender", Icon: IconCalendarToday, anim: "tear" },
  { to: "/plan", label: "Programmer", Icon: IconClipboard, anim: "write" },
  { to: "/historik", label: "Historik", Icon: IconClock, anim: "sweep" },
  {
    to: "/mere",
    label: "Mere",
    Icon: IconMore,
    anim: "pop",
    also: ["/mal", "/oevelser", "/kropsvaegt"],
  },
];

function NavItemLink({
  item,
  onSelect,
}: {
  item: NavItem;
  onSelect: (to: string) => void;
}) {
  const { pathname } = useLocation();
  const alsoActive = item.also?.some((p) => pathname.startsWith(p)) ?? false;

  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    e.preventDefault();
    onSelect(item.to);
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onClick}
      /* Ét aktivt punkt i guld — fanerne kendes på ikon og label, ikke på hver sin farve. */
      style={{ "--badge-color": "var(--color-gold-300)" } as CSSProperties}
      className={({ isActive: routeActive }) =>
        `relative z-10 flex min-w-16 flex-shrink-0 flex-col items-center gap-1 border border-transparent px-3 py-1.5 text-[11px] font-medium transition-colors ${
          routeActive || alsoActive
            ? "cat-glow"
            : "text-(--color-text-dim) active:text-(--color-text)"
        }`
      }
    >
      {({ isActive: routeActive }) => {
        const isActive = routeActive || alsoActive;
        return (
          <>
            {/* Lidt større klip-ramme end ikonet, så et hop får plads, mens fx pilen kan flyve helt ud. */}
            <span
              data-nav-active={isActive || undefined}
              className="relative -m-1 flex h-7 w-7 items-center justify-center overflow-hidden"
            >
              <item.Icon
                className={`h-5 w-5 ${isActive ? `nav-icon-${item.anim}` : ""}`}
              />
            </span>
            <span className="nav-label relative whitespace-nowrap">{item.label}</span>
          </>
        );
      }}
    </NavLink>
  );
}

const [homeItem, ...scrollableItems] = navItems;

/** Hvilken fane en sti hører til — -1 for sider uden fane (fx live-træning eller en øvelses detaljer). */
function tabIndexOf(pathname: string): number {
  return navItems.findIndex(
    (item) => item.to === pathname || item.also?.some((p) => pathname.startsWith(p)),
  );
}

const SWIPE_MIN_PX = 60;
const SLIDE_MS = 220;
const SLIDE_EASE = `transform ${SLIDE_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1)`;

/**
 * Swipe vandret på en fane bladrer til nabofanen, så man ikke behøver ramme bundmenuen.
 * Siden følger fingeren, glider ud over kanten, og den nye glider ind fra den modsatte side.
 * Ignorerer strøg, der starter i noget, der selv ruller vandret (filter-rækker, grafer, menuen),
 * og strøg der er mere lodrette end vandrette (almindelig scroll).
 */
export function useSwipeTabs(pageRef: RefObject<HTMLElement | null>) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    let start: { x: number; y: number; ignore: boolean } | null = null;
    let dragging = false; // afgjort som vandret strøg
    let dx = 0;

    const setX = (x: number, animate: boolean) => {
      const el = pageRef.current;
      if (!el) return;
      el.style.transition = animate ? SLIDE_EASE : "none";
      el.style.transform = x === 0 ? "" : `translateX(${x}px)`;
    };

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      let el = e.target as HTMLElement | null;
      let ignore = tabIndexOf(pathname) === -1;
      while (!ignore && el && el !== document.body) {
        const { overflowX } = getComputedStyle(el);
        if ((overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1) {
          ignore = true;
          break;
        }
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.closest("nav, .recharts-wrapper")) {
          ignore = true;
          break;
        }
        el = el.parentElement;
      }
      start = { x: t.clientX, y: t.clientY, ignore };
      dragging = false;
      dx = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!start || start.ignore) return;
      const t = e.touches[0];
      dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (!dragging) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          start.ignore = true; // lodret scroll — bland dig ikke
          return;
        }
        dragging = true;
      }
      const index = tabIndexOf(pathname);
      const hasNeighbor = navItems[index + (dx < 0 ? 1 : -1)] !== undefined;
      // Ingen nabo i den retning: gør modstand som iOS' egen kant.
      setX(hasNeighbor ? dx : dx / 4, false);
    };

    const onEnd = () => {
      if (!start || start.ignore || !dragging) {
        start = null;
        return;
      }
      start = null;
      const index = tabIndexOf(pathname);
      const next = navItems[index + (dx < 0 ? 1 : -1)];
      if (!next || Math.abs(dx) < SWIPE_MIN_PX) {
        setX(0, true);
        return;
      }
      const width = window.innerWidth;
      const direction = dx < 0 ? -1 : 1;
      /*
       * Den gamle side glider ud som en frosset kopi, mens den rigtige beholder skifter til den
       * nye side og glider ind samtidig — ellers stod skærmen tom, mens den nye side blev hentet.
       */
      const page = pageRef.current;
      const root = document.getElementById("root");
      if (page && root) {
        const ghost = document.createElement("div");
        ghost.setAttribute("aria-hidden", "true");
        ghost.style.cssText = `position:fixed;inset:0;z-index:15;overflow:hidden;pointer-events:none;background:var(--color-bg);transform:translateX(${dx}px)`;
        const copy = page.cloneNode(true) as HTMLElement;
        copy.style.transform = `translateY(${-root.scrollTop}px)`;
        copy.style.transition = "none";
        ghost.appendChild(copy);
        document.body.appendChild(ghost);
        void ghost.offsetWidth; // tving layout, så overgangen har et startpunkt
        ghost.style.transition = SLIDE_EASE;
        ghost.style.transform = `translateX(${direction * width}px)`;
        // Kun kopiens egen overgang — transitionend fra børn (piller, rulletekst) bobler også hertil.
        ghost.addEventListener("transitionend", (e) => e.target === ghost && ghost.remove());
        window.setTimeout(() => ghost.remove(), SLIDE_MS * 4); // fallback hvis overgangen aldrig melder færdig
      }
      // Den nye side starter klods op ad den gamle, så de to glider som ét sammenhængende bånd.
      setX(dx - direction * width, false);
      navigate(next.to);
      requestAnimationFrame(() => requestAnimationFrame(() => setX(0, true)));
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [pathname, navigate, pageRef]);
}

/** Bredde og placering af rulle-markøren, i procent af sporet. */
interface Thumb {
  width: number;
  left: number;
}

/** Pillens placering i menu-rækken (px), målt på det aktive punkt. */
interface Pill {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function BottomNav() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<Thumb>({ width: 0, left: 0 });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { rotation } = useRotation();
  const rowRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<Pill | null>(null);
  // Pillen glider kun ved sideskift; når menuen rulles, følger den med uden forsinkelse.
  const [pillSlides, setPillSlides] = useState(false);

  /*
   * Den aktive pille er ét element i menu-rækken, der glider hen til det valgte punkt (målt med
   * getBoundingClientRect, så scroll er regnet med). Det afløser en View Transition, som fik
   * telefonen til at tage et billede af hele siden ved hvert skift — det hakkede, og rulleteksten frøs.
   * Ligger punktet i den rullende del, klippes pillen til den synlige del, så den ikke lægger sig
   * ind over den fastgjorte Oversigt-fane.
   */
  const measurePill = (slide: boolean) => {
    const row = rowRef.current;
    const scroller = scrollerRef.current;
    const link = row
      ?.querySelector<HTMLElement>("[data-nav-active]")
      ?.closest("a");
    if (!row || !scroller || !link) return;
    const rowRect = row.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    let left = rect.left;
    let right = rect.right;
    if (scroller.contains(link)) {
      const s = scroller.getBoundingClientRect();
      left = Math.max(left, s.left);
      right = Math.min(right, s.right);
    }
    setPillSlides(slide);
    setPill({
      left: left - rowRect.left,
      top: rect.top - rowRect.top,
      width: Math.max(0, right - left),
      height: rect.height,
    });
  };

  useLayoutEffect(() => {
    // Efter et swipe kan den nye fane ligge uden for den rullende del — rul den frem først.
    const link = rowRef.current?.querySelector<HTMLElement>("[data-nav-active]")?.closest("a");
    const scroller = scrollerRef.current;
    if (link && scroller?.contains(link)) {
      const s = scroller.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      if (r.left < s.left) scroller.scrollBy({ left: r.left - s.left - 8, behavior: "smooth" });
      else if (r.right > s.right) scroller.scrollBy({ left: r.right - s.right + 8, behavior: "smooth" });
    }
    measurePill(pill !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
        measurePill(false);
      });
    };

    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      update();
      measurePill(false);
    });
    observer.observe(el);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      /*
       * Selve menuen er sin egen løftede flade med kant over og under; rulleteksten nedenunder
       * står på appens almindelige baggrund, så de to ikke flyder sammen.
       */
      className="fixed inset-x-0 bottom-0 z-20 bg-(--color-bg)"
      /*
       * Rulleteksten bor i den luft, der før var polstring: safe-area + 8 px er blevet til
       * 4 px + 20 px tekst + (safe-area − 16 px). Samme totalhøjde på telefonen, så menuen flytter sig ikke.
       */
      style={{
        paddingBottom:
          "max(0.25rem, calc(env(safe-area-inset-bottom, 0px) - 1rem))",
      }}
    >
      <div className="nav-menu border-y border-(--color-border) pb-1.5">
        <div ref={rowRef} className="relative flex items-stretch pt-2 pl-2">
          {pill && (
            <span
              aria-hidden="true"
              className={`cat-badge absolute left-0 top-0 rounded-xl border ${
                pillSlides
                  ? "transition-[transform,width] duration-[350ms] ease-[cubic-bezier(0.2,0.9,0.25,1.05)]"
                  : ""
              }`}
              style={
                {
                  "--badge-color": "var(--color-gold-300)",
                  width: pill.width,
                  height: pill.height,
                  transform: `translate(${pill.left}px, ${pill.top}px)`,
                } as CSSProperties
              }
            />
          )}
          {/* Fastgjort uden for scroll-containeren, så Oversigt altid kan nås uanset hvor langt man har scrollet menuen. */}
          <NavItemLink item={homeItem} onSelect={navigate} />
          <div className="mx-1 w-px flex-shrink-0 bg-(--color-border)" />
          <div
            ref={scrollerRef}
            className="no-scrollbar glow-scroller flex flex-1 items-center gap-1 overflow-x-auto pr-2"
          >
            {scrollableItems.map((item, i) => (
              <div key={item.to} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="h-6 w-px flex-shrink-0 bg-(--color-border)" />
                )}
                <NavItemLink item={item} onSelect={navigate} />
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
      </div>
      <div className="mt-1">
        <QuoteTicker quotes={rotation.map((q) => q.text)} />
      </div>
    </nav>
  );
}
