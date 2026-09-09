import { maybeUpdatePr } from "../../db/exercises";
import { addSet } from "../../db/sets";
import type { Exercise, SetEntry, SetType } from "../../types";

/** Logger et sæt og opdaterer øvelsens PR'er hvis relevant (normal/1RM-sæt). Delt af Træning og Live træning. */
export async function logSet(input: {
  sessionId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setType: SetType;
  order: number;
}): Promise<{ newSet: SetEntry; updatedExercise?: Exercise }> {
  const newSet = await addSet(input);
  const updatedExercise =
    input.setType === "normal" || input.setType === "1rm"
      ? await maybeUpdatePr(input.exerciseId, input.weight, input.reps)
      : undefined;
  return { newSet, updatedExercise };
}
