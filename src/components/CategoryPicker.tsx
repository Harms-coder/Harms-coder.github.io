import { EXERCISE_CATEGORIES } from "../db/exerciseSeed";

interface CategoryPickerProps {
  value?: string;
  onChange: (category: string | undefined) => void;
  allowDeselect?: boolean;
}

export function CategoryPicker({ value, onChange, allowDeselect = true }: CategoryPickerProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {EXERCISE_CATEGORIES.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(allowDeselect && value === category ? undefined : category)}
          className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
            value === category
              ? "accent-fill text-(--color-text)"
              : "bg-(--color-surface-2) text-(--color-text-muted)"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
