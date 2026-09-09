import { EXERCISE_CATEGORIES } from "../db/exerciseSeed";
import { IconSearch } from "./icons";

interface ExerciseFilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  category: string | null;
  onCategoryChange: (value: string | null) => void;
}

export function ExerciseFilterBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
}: ExerciseFilterBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3">
        <IconSearch className="h-4 w-4 flex-shrink-0 text-(--color-text-muted)" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Søg efter øvelse…"
          className="min-h-11 flex-1 bg-transparent text-base text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
        />
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
            category === null
              ? "accent-fill text-(--color-text)"
              : "glass-fill text-(--color-text-muted)"
          }`}
        >
          Alle
        </button>
        {EXERCISE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCategoryChange(c)}
            className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
              category === c
                ? "accent-fill text-(--color-text)"
                : "bg-(--color-surface-2) text-(--color-text-muted)"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
