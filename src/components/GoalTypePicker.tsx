import { GOAL_TYPE_LABELS } from "../db/goals";
import type { GoalType } from "../types";

const GOAL_TYPES = Object.keys(GOAL_TYPE_LABELS) as GoalType[];

interface GoalTypePickerProps {
  value: GoalType;
  onChange: (type: GoalType) => void;
}

export function GoalTypePicker({ value, onChange }: GoalTypePickerProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {GOAL_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
            value === type
              ? "accent-fill text-(--color-text)"
              : "bg-(--color-surface-2) text-(--color-text-muted)"
          }`}
        >
          {GOAL_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
