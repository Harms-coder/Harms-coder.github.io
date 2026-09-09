import { ROUTINE_COLORS } from "../db/routines";
import { IconCheck } from "./icons";

interface RoutineColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function RoutineColorPicker({ value, onChange }: RoutineColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {ROUTINE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={`Vælg farve ${color}`}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: color }}
        >
          {value === color && <IconCheck className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  );
}
