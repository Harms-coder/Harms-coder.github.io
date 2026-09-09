import {
  IconExerciseCarry,
  IconExerciseCrunch,
  IconExerciseCurl,
  IconExerciseDeadlift,
  IconExerciseDips,
  IconExerciseHangingLegRaise,
  IconExerciseHipThrust,
  IconExerciseKettlebellSwing,
  IconExerciseLateralRaise,
  IconExerciseLegMachine,
  IconExerciseLunge,
  IconExerciseOverheadPress,
  IconExercisePlaceholder,
  IconExercisePlank,
  IconExercisePullup,
  IconExerciseRow,
  IconExerciseShrug,
  IconExerciseSquat,
  IconExerciseTricepsExtension,
  IconExerciseWristCurl,
  type IconComponent,
} from "../components/icons";
import type { Exercise } from "../types";

/**
 * Nøgleord tjekkes i rækkefølge (mest specifikke først), så f.eks. "leg curl"
 * fanges før det generelle Ben-kategori-fald-tilbage til squat-positur.
 */
const KEYWORD_ICONS: [string, IconComponent][] = [
  ["dip", IconExerciseDips],
  ["dødløft", IconExerciseDeadlift],
  ["pull-through", IconExerciseDeadlift],
  ["bænkpres", IconExercisePlaceholder],
  ["udfald", IconExerciseLunge],
  ["split squat", IconExerciseLunge],
  ["step-up", IconExerciseLunge],
  ["step up", IconExerciseLunge],
  ["curtsy", IconExerciseLunge],
  ["squat", IconExerciseSquat],
  ["leg curl", IconExerciseLegMachine],
  ["leg extension", IconExerciseLegMachine],
  ["benpres", IconExerciseLegMachine],
  ["roning", IconExerciseRow],
  ["rygrejsning", IconExerciseRow],
  ["row", IconExerciseRow],
  ["pulldown", IconExercisePullup],
  ["kropshævning", IconExercisePullup],
  ["pull-up", IconExercisePullup],
  ["pull up", IconExercisePullup],
  ["thruster", IconExerciseOverheadPress],
  ["press", IconExerciseOverheadPress],
  ["rejsning", IconExerciseLateralRaise],
  ["raise", IconExerciseLateralRaise],
  ["fly", IconExerciseLateralRaise],
  ["crossover", IconExerciseLateralRaise],
  ["pec deck", IconExerciseLateralRaise],
  ["shrug", IconExerciseShrug],
  ["armstrækning", IconExercisePlank],
  ["push-up", IconExercisePlank],
  ["push up", IconExercisePlank],
  ["diamond push", IconExercisePlank],
  ["plank", IconExercisePlank],
  ["mountain climb", IconExercisePlank],
  ["hængende benløft", IconExerciseHangingLegRaise],
  ["farmer", IconExerciseCarry],
  ["slædeskub", IconExerciseCarry],
  ["kettlebell", IconExerciseKettlebellSwing],
];

const CATEGORY_ICONS: Record<string, IconComponent> = {
  Bryst: IconExercisePlaceholder,
  Ryg: IconExerciseRow,
  Ben: IconExerciseSquat,
  Skuldre: IconExerciseOverheadPress,
  Biceps: IconExerciseCurl,
  Triceps: IconExerciseTricepsExtension,
  Mave: IconExerciseCrunch,
  Baller: IconExerciseHipThrust,
  Underarme: IconExerciseWristCurl,
  Helkrop: IconExerciseKettlebellSwing,
};

/** Vælger en positur der matcher øvelsens bevægelse, ud fra navn og kategori. */
export function getExerciseIcon(exercise: Pick<Exercise, "name" | "category">): IconComponent {
  const name = exercise.name.toLowerCase();
  for (const [keyword, Icon] of KEYWORD_ICONS) {
    if (name.includes(keyword)) return Icon;
  }
  if (exercise.category && CATEGORY_ICONS[exercise.category]) {
    return CATEGORY_ICONS[exercise.category];
  }
  return IconExercisePlaceholder;
}

/**
 * URL-sikkert filnavn ud fra øvelsens navn, fx "Flad bænkpres med vægtstang" -> "flad-baenkpres-med-vaegtstang".
 * Bruges til at slå et evt. øvelsesbillede op i public/images/exercises/ — se ExerciseIcon.tsx.
 */
export function slugifyExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll("æ", "ae")
    .replaceAll("ø", "oe")
    .replaceAll("å", "aa")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
