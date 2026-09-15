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
import { DB_CHANGED_EVENT } from "../db/database";
import { navItems, tabIndexOf } from "./BottomNav";

const SWIPE_MIN_PX = 60;
/** Et hurtigt flick må gerne være kortere end SWIPE_MIN_PX. */
const FLICK_PX_PER_MS = 0.45;
const SLIDE_MAX_MS = 520;
const SLIDE_MIN_MS = 320;
/** Fingerens fart tæller kun delvist, ellers bliver et svirp til et hop. */
const VELOCITY_WEIGHT = 0.5;
const SLIDE_EASE = "cubic-bezier(0.25, 1, 0.4, 1)";
/** Ro på siden, før nabosiderne bygges i baggrunden. Længere end et slip-glid, så det ikke hakker. */
const PREMOUNT_DELAY_MS = 450;

interface MountedPage {
  path: string;
  /** Skifter, når siden skal bygges forfra (data ændret) — indgår i React-nøglen. */
  gen: number;
}

interface Gesture {
  x: number;
  y: number;
  ignore: boolean;
  dragging: boolean;
  /** -1 = siden trækkes mod venstre (næste fane), 1 = mod højre (forrige). */
  direction: -1 | 1;
  dx: number;
  /** De seneste punkter (x, tid) — farten måles over det sidste stykke, ikke kun sidste hændelse. */
  trail: { x: number; t: number }[];
}

const VELOCITY_WINDOW_MS = 80;

/** px/ms over det sidste stykke af strøget. En finger, der bremser lige før slip, giver lav fart. */
function velocityOf(trail: { x: number; t: number }[]): number {
  const last = trail[trail.length - 1];
  const first = trail.find((p) => last.t - p.t <= VELOCITY_WINDOW_MS) ?? trail[0];
  const dt = last.t - first.t;
  return dt > 0 ? (last.x - first.x) / dt : 0;
}

interface Settle {
  direction: -1 | 1;
  dx: number;
  velocity: number;
}

function neighborPaths(pathname: string): string[] {
  const index = tabIndexOf(pathname);
  if (index === -1) return [];
  return [navItems[index - 1], navItems[index + 1]].filter(Boolean).map((item) => item.to);
}

/**
 * Hvor mange skærmbredder en fane ligger fra den levende (efter fanens nummer i bundmenuen), så en
 * tidligere nabo, der endnu ikke er ryddet op, ikke lander oven i den nye — sider uden fane parkeres langt væk.
 */
function stepsFrom(path: string, livePath: string): number {
  const from = tabIndexOf(livePath);
  const to = tabIndexOf(path);
  if (from === -1 || to === -1) return 2;
  return to - from;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Swipe vandret på en fane bladrer til nabofanen, så man ikke behøver ramme bundmenuen.
 *
 * Den levende side ligger i det almindelige flow. Nabofanerne (den til venstre og den til højre i
 * bundmenuen) er RIGTIGT monteret på forhånd — bygget i ro, lidt efter man er landet på en side — og
 * står fastgjort uden for hver sin kant. Et strøg skubber hele båndet med fingeren; slippes der
 * langt nok (eller med et flick), bytter naboen og den levende side roller, og båndet glider på
 * plads med fingerens fart. Ellers glider det tilbage.
 *
 * Alle sider har en stabil nøgle (sti + generation), så en nabo, der bliver levende, beholder
 * sin tilstand — intet remount, ingen "Indlæser…". Ændres der noget i databasen, smides naboerne
 * væk og bygges igen, så de aldrig viser gamle tal. Hver side husker sin rulleposition.
 *
 * Positioner sættes direkte på elementerne (ikke via React-state), så hver touchmove er billig.
 * Strøg, der starter i noget, der selv ruller vandret (filter-rækker, grafer, menuen), og strøg der
 * er mere lodrette end vandrette (almindelig scroll), ignoreres.
 */
export function PageSwiper({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [mounted, setMounted] = useState<MountedPage[]>([]);
  const gen = useRef(0);
  const els = useRef(new Map<string, HTMLDivElement>());
  const scrollTops = useRef(new Map<string, number>());
  const gesture = useRef<Gesture | null>(null);
  const settle = useRef<Settle | null>(null);
  const settling = useRef(false);

  const root = () => document.getElementById("root");

  /**
   * Lægger hele båndet: den levende side ved `offset`, naboerne én skærmbredde til hver side.
   * `ms` > 0 animerer derhen.
   */
  const layout = (livePath: string, offset: number, ms = 0) => {
    const width = window.innerWidth;
    for (const [path, el] of els.current) {
      const x = path === livePath ? offset : stepsFrom(path, livePath) * width + offset;
      el.style.transition = ms > 0 ? `transform ${ms}ms ${SLIDE_EASE}` : "none";
      el.style.transform = x === 0 ? "" : `translateX(${x}px)`;
    }
  };

  const setWillChange = (on: boolean) => {
    for (const el of els.current.values()) el.style.willChange = on ? "transform" : "";
  };

  const ensureMounted = (paths: string[]) =>
    setMounted((current) => {
      const missing = paths.filter((path) => !current.some((page) => page.path === path));
      if (missing.length === 0) return current;
      return [...current, ...missing.map((path) => ({ path, gen: ++gen.current }))];
    });

  // Den levende side skal altid have en post (med gen 0 som i første render), så dens nøgle er
  // stabil, når den senere bliver nabo og glider ud — ellers ville den remounte midt i glidet.
  useEffect(() => {
    setMounted((current) =>
      current.some((page) => page.path === pathname) ? current : [...current, { path: pathname, gen: 0 }],
    );
  }, [pathname]);

  // Husk hvor langt hver side er rullet, så en tilbagevenden lander samme sted.
  useEffect(() => {
    const el = root();
    if (!el) return;
    const onScroll = () => scrollTops.current.set(pathname, el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Data ændret: naboerne kan vise gamle tal — væk med dem. De bygges igen af effekten herunder.
  useEffect(() => {
    const onChanged = () =>
      setMounted((current) => current.filter((page) => page.path === pathname));
    window.addEventListener(DB_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(DB_CHANGED_EVENT, onChanged);
  }, [pathname]);

  // Lidt efter man er landet: byg naboerne i baggrunden, smid dem der ikke længere er naboer.
  useEffect(() => {
    const id = window.setTimeout(() => {
      startTransition(() => {
        setMounted((current) => {
          const wanted = neighborPaths(pathname);
          const kept = current.filter((page) => page.path === pathname || wanted.includes(page.path));
          const missing = wanted.filter((path) => !kept.some((page) => page.path === path));
          if (missing.length === 0 && kept.length === current.length) return current;
          return [...kept, ...missing.map((path) => ({ path, gen: ++gen.current }))];
        });
      });
    }, PREMOUNT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [pathname, mounted]);

  // Nye naboer er i DOM'en: stil dem ved kanten (midt i et strøg: dér hvor båndet er lige nu).
  useLayoutEffect(() => {
    if (settle.current) return; // rollebyttet lægger selv båndet
    const g = gesture.current;
    layout(pathname, g?.dragging ? g.dx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Sideskift: enten et rollebytte efter et strøg (glid på plads) eller et almindeligt skift (stå stille).
  useLayoutEffect(() => {
    const el = root();
    if (el) el.scrollTo(0, scrollTops.current.get(pathname) ?? 0);

    const s = settle.current;
    settle.current = null;
    if (!s) {
      layout(pathname, 0);
      return;
    }
    const width = window.innerWidth;
    // Båndet står stadig, hvor fingeren slap: den nye levende side er `remaining` px fra plads.
    const offset = s.dx - s.direction * width;
    layout(pathname, offset);
    void el?.offsetWidth; // tving layout, så overgangen har et startpunkt
    const remaining = Math.abs(offset);
    const speed = Math.max(Math.abs(s.velocity) * VELOCITY_WEIGHT, width / SLIDE_MAX_MS);
    const ms = clamp(remaining / speed, SLIDE_MIN_MS, SLIDE_MAX_MS);
    layout(pathname, 0, ms);
    const id = window.setTimeout(() => {
      settling.current = false;
      setWillChange(false);
    }, ms + 40);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (settling.current) return;
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
      gesture.current = {
        x: t.clientX,
        y: t.clientY,
        ignore,
        dragging: false,
        direction: -1,
        dx: 0,
        trail: [{ x: t.clientX, t: performance.now() }],
      };
    };

    const onMove = (e: TouchEvent) => {
      const g = gesture.current;
      if (!g || g.ignore) return;
      const t = e.touches[0];
      g.dx = t.clientX - g.x;
      const dy = t.clientY - g.y;
      g.trail.push({ x: t.clientX, t: performance.now() });
      if (g.trail.length > 12) g.trail.shift();

      if (!g.dragging) {
        if (Math.abs(g.dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(g.dx)) {
          g.ignore = true; // lodret scroll — bland dig ikke
          return;
        }
        g.dragging = true;
        g.direction = g.dx < 0 ? -1 : 1;
        setWillChange(true);
        // Naboen er normalt bygget på forhånd; er den ikke (strøg lige efter landing), så byg den nu.
        const next = navItems[tabIndexOf(pathname) - g.direction];
        if (next) startTransition(() => ensureMounted([next.to]));
      }

      const hasNeighbor = navItems[tabIndexOf(pathname) - g.direction] !== undefined;
      // Trækkes der tilbage forbi udgangspunktet, eller er der ingen nabo: gør modstand som iOS' egen kant.
      layout(pathname, hasNeighbor && Math.sign(g.dx) === g.direction ? g.dx : g.dx / 4);
    };

    const onEnd = () => {
      const g = gesture.current;
      gesture.current = null;
      if (!g || g.ignore || !g.dragging) return;
      const width = window.innerWidth;
      const next = navItems[tabIndexOf(pathname) - g.direction];
      const velocity = velocityOf(g.trail);
      const farEnough = Math.abs(g.dx) >= SWIPE_MIN_PX;
      const flicked =
        Math.abs(g.dx) >= 20 && Math.sign(velocity) === g.direction && Math.abs(velocity) >= FLICK_PX_PER_MS;

      if (!next || Math.sign(g.dx) !== g.direction || !(farEnough || flicked)) {
        const ms = clamp(Math.abs(g.dx) / (width / SLIDE_MAX_MS), SLIDE_MIN_MS, SLIDE_MAX_MS);
        layout(pathname, 0, ms);
        window.setTimeout(() => setWillChange(false), ms + 40);
        return;
      }

      settling.current = true;
      settle.current = { direction: g.direction, dx: g.dx, velocity };
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
  }, [pathname, navigate]);

  const fixedStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 15,
    overflow: "hidden",
    pointerEvents: "none",
  };

  // Den levende side + naboerne, i fast rækkefølge (sti), så React matcher på nøgle og aldrig remounter.
  const pages = [...mounted];
  if (!pages.some((page) => page.path === pathname)) pages.push({ path: pathname, gen: 0 });
  pages.sort((a, b) => a.path.localeCompare(b.path));

  return (
    <>
      {pages.map((page) => {
        const isLive = page.path === pathname;
        const scrollTop = isLive ? 0 : (scrollTops.current.get(page.path) ?? 0);
        return (
          <div
            key={`${page.path}#${page.gen}`}
            ref={(el) => {
              if (el) els.current.set(page.path, el);
              else els.current.delete(page.path);
            }}
            /* touch-action: pan-y — lodret scroll er browserens, vandrette strøg er vores. */
            className="safe-top relative z-10 touch-pan-y"
            style={isLive ? undefined : fixedStyle}
          >
            {/* En fastgjort nabo vises dér, hvor den var rullet til — som et vindue ind til siden. */}
            <div style={scrollTop ? { transform: `translateY(${-scrollTop}px)` } : undefined}>
              {/* Altid en location — med prop'en lægger Routes et ekstra context-lag ind, og skiftede
                  den mellem sat/ikke sat, ville hele siden remounte, når en nabo blev levende. */}
              <Routes location={isLive ? location : page.path}>{children}</Routes>
            </div>
          </div>
        );
      })}
    </>
  );
}
