import { useRef, type PointerEvent, type ReactNode } from "react";
import { IconTrash } from "./icons";

const DELETE_WIDTH = 96;
/* Luft mellem kortet og sletknappen, så begge står som hver sin afrundede brik. */
const GAP = 8;
const OPEN_OFFSET = DELETE_WIDTH + GAP;
const TAP_THRESHOLD = 4;
const SNAP_EASE = "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)";

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Swipe-til-venstre-for-at-slette, som notifikationer på telefonen — rører ikke børnenes egne klik,
 * medmindre man tapper for at lukke en åben sletknap igen.
 *
 * Ingen React-state under trækket: transformen sættes direkte på elementet, højst én gang pr.
 * skærmbillede. Med setState pr. pointer-hændelse blev hele kortet gentegnet 60-120 gange i
 * sekundet, og det hakkede på telefonen.
 */
export function SwipeToDelete({ onDelete, children, className = "" }: SwipeToDeleteProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pendingRef = useRef(0);
  const frameRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const suppressClickRef = useRef(false);

  function apply(offset: number, animate: boolean) {
    const el = panelRef.current;
    if (!el) return;
    el.style.transition = animate ? SNAP_EASE : "none";
    el.style.transform = `translate3d(${offset}px, 0, 0)`;
    offsetRef.current = offset;
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    // Følg fingeren, også når den forlader kortet undervejs.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > TAP_THRESHOLD) movedRef.current = true;
    pendingRef.current = Math.min(0, Math.max(-OPEN_OFFSET, startOffsetRef.current + delta));
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      apply(pendingRef.current, false);
    });
  }

  function handlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }

    if (movedRef.current) {
      // Et rigtigt træk skete — klikket der naturligt ville fyre bagefter (samme start-/slutelement)
      // skal ikke nå indholdet, ellers åbner/lukker man fx en historik-række samtidig med at swipe'et.
      suppressClickRef.current = true;
      apply(pendingRef.current < -OPEN_OFFSET / 2 ? -OPEN_OFFSET : 0, true);
      return;
    }

    if (startOffsetRef.current < 0) {
      // Tap mens sletknappen var åben: luk den, og sluge klikket der ellers ville ramme indholdet.
      suppressClickRef.current = true;
      apply(0, true);
      return;
    }
    // Almindeligt tap mens lukket: lad indholdets eget klik ske som normalt (fx udvid/kollaps).
  }

  function handleClickCapture(e: React.MouseEvent) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => {
          apply(0, true);
          onDelete();
        }}
        aria-label="Slet"
        style={{ width: DELETE_WIDTH }}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-(--color-danger) text-white active:opacity-80"
      >
        <IconTrash className="h-4 w-4" />
        <span className="text-[12px] font-medium">Slet</span>
      </button>
      <div
        ref={panelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        style={{ transform: "translate3d(0, 0, 0)", touchAction: "pan-y", willChange: "transform" }}
      >
        {children}
      </div>
    </div>
  );
}
