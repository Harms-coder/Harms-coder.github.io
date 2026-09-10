import { EXERCISE_CATEGORIES } from "../db/exerciseSeed";
import { FAVORITES_FILTER } from "../lib/exerciseFilter";
import { IconSearch } from "./icons";
import { SegmentedControl } from "./SegmentedControl";

/** Sentinel for "ingen kategori valgt" — EXERCISE_CATEGORIES indeholder ikke "Alle". */
const ALL = "Alle";

const CATEGORY_OPTIONS = [ALL, FAVORITES_FILTER, ...EXERCISE_CATEGORIES].map((c) => ({
  value: c,
  label: c,
}));

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
        <IconSearch className="h-4 w-4 flex-shrink-0 text-(--color-cat-library)" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Søg efter øvelse…"
          className="min-h-11 flex-1 bg-transparent text-base text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
        />
      </div>
      {/* Øvelsesbiblioteket har sin egen grønne kategorifarve overalt, også når baren vises
          inde i en anden sides farve (fx den lilla kalenderplanlægger). */}
      <SegmentedControl
        options={CATEGORY_OPTIONS}
        value={category ?? ALL}
        onChange={(value) => onCategoryChange(value === ALL ? null : value)}
        layout="scroll"
        tone="library"
      />
    </div>
  );
}
