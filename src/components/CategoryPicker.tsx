import { EXERCISE_CATEGORIES } from "../db/exerciseSeed";
import { SegmentedControl } from "./SegmentedControl";

interface CategoryPickerProps {
  value?: string;
  onChange: (category: string | undefined) => void;
  allowDeselect?: boolean;
}

/** SegmentedControl i øvelsesbibliotekets grønne, der kan fravælges (ingen kategori). */
export function CategoryPicker({ value, onChange, allowDeselect = true }: CategoryPickerProps) {
  return (
    <SegmentedControl
      options={EXERCISE_CATEGORIES.map((category) => ({ value: category, label: category }))}
      value={value}
      onChange={(category) => onChange(allowDeselect && value === category ? undefined : category)}
      layout="scroll"
      tone="library"
    />
  );
}
