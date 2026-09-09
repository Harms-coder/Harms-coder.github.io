import { CARDIO_ACTIVITIES } from "../db/cardio";

interface ActivityPickerProps {
  value: string;
  onChange: (activity: string) => void;
}

export function ActivityPicker({ value, onChange }: ActivityPickerProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {CARDIO_ACTIVITIES.map((activity) => (
        <button
          key={activity}
          type="button"
          onClick={() => onChange(activity)}
          className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
            value === activity
              ? "accent-fill text-(--color-text)"
              : "bg-(--color-surface-2) text-(--color-text-muted)"
          }`}
        >
          {activity}
        </button>
      ))}
    </div>
  );
}
