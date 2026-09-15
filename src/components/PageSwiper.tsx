import {
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Routes, useLocation, useNavigate } from "react-router-dom";
import { navItems, tabIndexOf } from "./BottomNav";

const SWIPE_MIN_PX = 60;
/** Et hurtigt flick må gerne være kortere end SWIPE_MIN_PX. */
const FLICK_PX_PER_MS = 0.45;
const SLIDE_MS = 260;
const SLIDE_EASE = `transform ${SLIDE_MS}ms cubic-bezier(0.2, 0.9, 0.25, 1)`;

/** Den anden side under et strøg: den man trækker frem, eller den der er på vej ud. */
interface Other {
  slot: 0 | 1;
  path: string;
  role: "preview" | "outgoing";
  /** -1 = siden bevæger sig mod venstre (næste fane), 1 = mod højre (forrige). */
  direction: -1 | 1;
  /** Rul på #root da siden blev sendt ud — den fastgjorte kopi skal stå samme sted. */
  scrollTop: number;
}

interface Gesture {
  x: number;
  y: number;
  ignore: boolean;
  dragging: boolean;
  direction: -1 | 1;
  dx: number;
  lastX: number;
  lastT: number;
  velocity: number;
}

/**
 * Swipe vandret på en fane bladrer til nabofanen, så man ikke behøver ramme bundmenuen.
 *
 * Der er to "slots". Den levende side ligger i sit slot i det almindelige flow. Så snart et strøg
 * er afgjort som vandret, monteres nabosiden RIGTIGT i det andet slot (fastgjort uden for kanten)
 * og trækkes med fingeren — så er dens data hentet, og den står færdig, når man slipper. Slippes
 * der langt nok (eller med et flick), bytter de roller: den nye bliver levende og glider på plads,
 * den gamle fastgøres på sin rulleposition og glider ud. Ellers glider begge tilbage.
 *
 * Positioner sættes direkte på elementerne (ikke via React-state), så hver touchmove er billig.
 * Ignorerer strøg, der starter i noget, der selv ruller vandret (filter-rækker, grafer, menuen),
 * og strøg der er mere lodrette end vandrette (almindelig scroll).
 */
export function PageSwiper({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [live, setLive] = useState<0 | 1>(0);
  const [other, setOther] = useState<Other | null>(null);
  const slotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const gesture = useRef<Gesture | null>(null);
  const settling = useRef(false);

  const setX = (el: HTMLElement | null, x: number, animate: boolean) => {
    if (!el) return;
    el.style.transition = animate ? SLIDE_EASE : "none";
    el.style.transform = x === 0 ? "" : `translateX(${x}px)`;
  };

  // Nabosiden dukker op (evt. et par billeder efter strøget startede) — sæt den ved kanten med det samme.
  useLayoutEffect(() => {
    if (other?.role !== "preview") return;
    const g = gesture.current;
    const width = window.innerWidth;
    const el = slotRefs[other.slot].current;
    if (el) el.style.willChange = "transform";
    setX(el, g ? g.dx - g.direction * width : width, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [other]);

  // Rollebyttet er renderet: nu glider den gamle ud og den nye på plads.
  useLayoutEffect(() => {
    if (other?.role !== "outgoing") return;
    const outgoing = slotRefs[other.slot].current;
    const incoming = slotRefs[live].current;
    const { direction } = other;
    document.getElementById("root")?.scrollTo(0, 0); // den nye side starter øverst
    void outgoing?.offsetWidth; // tving layout, så overgangen har et startpunkt
    setX(outgoing, direction * window.innerWidth, true);
    setX(incoming, 0, true);
    const id = window.setTimeout(() => {
      if (incoming) incoming.style.willChange = "";
      settling.current = false;
      setOther(null);
    }, SLIDE_MS + 40);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [other]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (settling.current) return;
      const t = e.touches[0];
      let el = e.target as HTMLElement | null;
      let ignore = tabIndexOf(location.pathname) === -1;
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
      gesture.current = {
        x: t.clientX,
        y: t.clientY,
        ignore,
        dragging: false,
        direction: -1,
        dx: 0,
        lastX: t.clientX,
        lastT: e.timeStamp,
        velocity: 0,
      };
    };

    const onMove = (e: TouchEvent) => {
      const g = gesture.current;
      if (!g || g.ignore) return;
      const t = e.touches[0];
      g.dx = t.clientX - g.x;
      const dy = t.clientY - g.y;
      const dt = e.timeStamp - g.lastT;
      if (dt > 0) g.velocity = (t.clientX - g.lastX) / dt;
      g.lastX = t.clientX;
      g.lastT = e.timeStamp;

      if (!g.dragging) {
        if (Math.abs(g.dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(g.dx)) {
          g.ignore = true; // lodret scroll — bland dig ikke
          return;
        }
        g.dragging = true;
        g.direction = g.dx < 0 ? -1 : 1;
        const index = tabIndexOf(location.pathname);
        const next = navItems[index - g.direction];
        const liveEl = slotRefs[live].current;
        if (liveEl) liveEl.style.willChange = "transform";
        if (next) {
          // Ikke-hastende render: siden må gerne komme et par billeder senere, bare fingeren følges nu.
          const slot: 0 | 1 = live === 0 ? 1 : 0;
          startTransition(() =>
            setOther({ slot, path: next.to, role: "preview", direction: g.direction, scrollTop: 0 }),
          );
        }
      }

      const width = window.innerWidth;
      const hasNeighbor = navItems[tabIndexOf(location.pathname) - g.direction] !== undefined;
      // Trækkes der tilbage forbi udgangspunktet, eller er der ingen nabo: gør modstand som iOS' egen kant.
      const x = hasNeighbor && Math.sign(g.dx) === g.direction ? g.dx : g.dx / 4;
      setX(slotRefs[live].current, x, false);
      const previewSlot: 0 | 1 = live === 0 ? 1 : 0;
      setX(slotRefs[previewSlot].current, x - g.direction * width, false);
    };

    const onEnd = () => {
      const g = gesture.current;
      gesture.current = null;
      if (!g || g.ignore || !g.dragging) return;
      const width = window.innerWidth;
      const index = tabIndexOf(location.pathname);
      const next = navItems[index - g.direction];
      const liveEl = slotRefs[live].current;
      const previewSlot: 0 | 1 = live === 0 ? 1 : 0;
      const previewEl = slotRefs[previewSlot].current;
      const farEnough = Math.abs(g.dx) >= SWIPE_MIN_PX;
      const flicked = Math.abs(g.dx) >= 20 && Math.sign(g.velocity) === g.direction && Math.abs(g.velocity) >= FLICK_PX_PER_MS;

      if (!next || Math.sign(g.dx) !== g.direction || !(farEnough || flicked)) {
        setX(liveEl, 0, true);
        setX(previewEl, g.direction * -width, true);
        window.setTimeout(() => {
          if (liveEl) liveEl.style.willChange = "";
          setOther(null);
        }, SLIDE_MS + 40);
        return;
      }

      settling.current = true;
      const scrollTop = document.getElementById("root")?.scrollTop ?? 0;
      // Rollebytte: det viste slot bliver levende (samme træ, så siden beholder sin tilstand),
      // det gamle bliver "outgoing" og fastgøres på sin rulleposition. Selve glidet sker i layout-effekten.
      setLive(previewSlot);
      setOther({ slot: live, path: location.pathname, role: "outgoing", direction: g.direction, scrollTop });
      navigate(next.to);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, live, navigate]);

  const fixedStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 15,
    overflow: "hidden",
    pointerEvents: "none",
  };

  return (
    <>
      {([0, 1] as const).map((slot) => {
        const isLive = slot === live;
        if (!isLive && other?.slot !== slot) return null;
        return (
          <div
            key={slot}
            ref={slotRefs[slot]}
            /* touch-action: pan-y — lodret scroll er browserens, vandrette strøg er vores. */
            className="safe-top relative z-10 touch-pan-y"
            style={isLive ? undefined : fixedStyle}
          >
            <div style={isLive || !other ? undefined : { transform: `translateY(${-other.scrollTop}px)` }}>
              <Routes location={isLive ? undefined : other?.path}>{children}</Routes>
            </div>
          </div>
        );
      })}
    </>
  );
}
