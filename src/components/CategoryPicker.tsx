import type { CSSProperties } from "react";
import { EXERCISE_CATEGORIES } from "../db/exerciseSeed";

interface CategoryPickerProps {
  value?: string;
  onChange: (category: string | undefined) => void;
  allowDeselect?: boolean;
}

/**
 * Som SegmentedControl, men kan fravælges (ingen kategori) — derfor egen komponent.
 * Farven er øvelsesbibliotekets grønne, samme som ExerciseFilterBar.
 */
export function CategoryPicker({ value, onChange, allowDeselect = true }: CategoryPickerProps) {
  return (
    <div
      className="no-scrollbar glow-scroller glow-scroller-x flex gap-2 overflow-x-auto"
      style={{ "--badge-color": "var(--color-cat-library)" } as CSSProperties}
    >
      {EXERCISE_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(allowDeselect && value === category ? undefined : category)}
          className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
            value === category
              ? "cat-fill text-(--color-text)"
              : "glass-fill text-(--color-text-muted)"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
