import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { IconTrash } from "./icons";

const DELETE_WIDTH = 96;
/* Luft mellem kortet og sletknappen, så begge står som hver sin afrundede brik. */
const GAP = 8;
const OPEN_OFFSET = DELETE_WIDTH + GAP;
const TAP_THRESHOLD = 4;

interface SwipeToDeleteProps {
  onDelete: () => void;
  children: ReactNode;
  className?: string;
}

/** Swipe-til-venstre-for-at-slette, som notifikationer på telefonen — rører ikke børnenes egne klik, medmindre man tapper for at lukke en åben sletknap igen. */
export function SwipeToDelete({ onDelete, children, className = "" }: SwipeToDeleteProps) {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const suppressClickRef = useRef(false);

  function handlePointerDown(e: PointerEvent) {
    draggingRef.current = true;
    setIsDragging(true);
    movedRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = offset;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!draggingRef.current) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > TAP_THRESHOLD) movedRef.current = true;
    setOffset(Math.min(0, Math.max(-OPEN_OFFSET, startOffsetRef.current + delta)));
  }

  function handlePointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);

    if (movedRef.current) {
      // Et rigtigt træk skete — klikket der naturligt ville fyre bagefter (samme start-/slutelement)
      // skal ikke nå indholdet, ellers åbner/lukker man fx en historik-række samtidig med at swipe'et.
      suppressClickRef.current = true;
      setOffset((current) => (current < -OPEN_OFFSET / 2 ? -OPEN_OFFSET : 0));
      return;
    }

    if (startOffsetRef.current < 0) {
      // Tap mens sletknappen var åben: luk den, og sluge klikket der ellers ville ramme indholdet.
      suppressClickRef.current = true;
      setOffset(0);
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
          setOffset(0);
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClickCapture={handleClickCapture}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}
