import { CARDIO_ACTIVITIES } from "../db/cardio";
import { SegmentedControl } from "./SegmentedControl";

interface ActivityPickerProps {
  value: string;
  onChange: (activity: string) => void;
}

export function ActivityPicker({ value, onChange }: ActivityPickerProps) {
  return (
    <SegmentedControl
      options={CARDIO_ACTIVITIES.map((activity) => ({ value: activity, label: activity }))}
      value={value}
      onChange={onChange}
      layout="scroll"
    />
  );
}
