import { getExerciseIcon } from "../lib/exerciseIcon";
import type { Exercise } from "../types";

interface ExerciseIconProps {
  exercise: Pick<Exercise, "name" | "category">;
  size?: number;
}

/** Positur der matcher øvelsens bevægelse (se `getExerciseIcon`), tegnet i samme streg-stil som bundnavigationen. */
export function ExerciseIcon({ exercise, size = 64 }: ExerciseIconProps) {
  const Icon = getExerciseIcon(exercise);
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-(--color-surface-2)"
      style={{ width: size, height: size }}
    >
      <Icon
        className="text-(--color-accent-glow)"
        style={{ width: size * 0.82, height: size * 0.82 }}
      />
    </span>
  );
}
