import { useEffect, useRef, useState } from "react";
import { IconMore, IconPencil, IconTrash } from "./icons";

interface CardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

/** Diskret 3-dot-menu til redigér/slet på entry-cards, i stedet for store synlige ikon-cirkler. */
export function CardActions({ onEdit, onDelete }: CardActionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Flere handlinger"
        className="flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-muted) active:bg-(--color-surface-2)"
      >
        <IconMore className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-10 flex min-w-[132px] flex-col overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface-3) card-shadow">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-left text-[13px] text-(--color-text) active:bg-(--color-surface-2)"
          >
            <IconPencil className="h-3.5 w-3.5" />
            Redigér
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-left text-[13px] text-(--color-danger) active:bg-(--color-surface-2)"
          >
            <IconTrash className="h-3.5 w-3.5" />
            Slet
          </button>
        </div>
      )}
    </div>
  );
}
