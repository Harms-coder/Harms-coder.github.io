import { useState } from "react";
import { getExerciseIcon, slugifyExerciseName } from "../../lib/exerciseIcon";
import type { Exercise } from "../../types";

const THUMB_WIDTH = 96;

/**
 * Fladt, firkantet øvelsesbillede der fylder hele kortets højde (i stedet for en lille
 * indsat cirkel) — kortets egen højde bestemmes stadig af tekstindholdet, så billedet
 * bliver større uden at gøre kortet højere. Falder tilbage til stregfiguren hvis intet
 * billede findes under public/images/exercises/.
 */
export function ExercisePhotoThumb({
  exercise,
}: {
  exercise: Pick<Exercise, "name" | "category">;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const Icon = getExerciseIcon(exercise);

  return (
    <span
      className="flex flex-shrink-0 items-center justify-center bg-(--color-surface-2)"
      style={{ width: THUMB_WIDTH }}
    >
      {photoFailed ? (
        <Icon className="h-10 w-10 text-(--color-accent-glow)" />
      ) : (
        <img
          src={`/images/exercises/${slugifyExerciseName(exercise.name)}.png`}
          alt=""
          className="h-full w-full object-contain p-1.5"
          onError={() => setPhotoFailed(true)}
        />
      )}
    </span>
  );
}
