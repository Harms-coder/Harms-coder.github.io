import { useState } from "react";
import { getExerciseIcon, slugifyExerciseName } from "../lib/exerciseIcon";
import type { Exercise } from "../types";

interface ExerciseIconProps {
  exercise: Pick<Exercise, "name" | "category">;
  size?: number;
}

/**
 * Lille rund badge med et øvelsesbillede fra public/images/exercises/<slug>.png hvis det findes
 * (se slugifyExerciseName), ellers falder den tilbage til den hånd-tegnede positur
 * (`getExerciseIcon`). Bruges i kompakte lister (fx ExercisePicker). Til den store, flade
 * thumbnail i selve øvelseslisten, se ExercisePhotoThumb.
 */
export function ExerciseIcon({ exercise, size = 64 }: ExerciseIconProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const Icon = getExerciseIcon(exercise);

  return (
    <span
      className="flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-surface-2)"
      style={{ width: size, height: size }}
    >
      {photoFailed ? (
        <Icon
          className="text-(--color-cat-strength)"
          style={{ width: size * 0.82, height: size * 0.82 }}
        />
      ) : (
        <img
          src={`/images/exercises/${slugifyExerciseName(exercise.name)}.png`}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setPhotoFailed(true)}
        />
      )}
    </span>
  );
}
