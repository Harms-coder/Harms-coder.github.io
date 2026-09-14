export interface Exercise {
  id: string;
  name: string;
  category?: string;
  /** Kort, valgfri beskrivelse af øvelsen, indtastet af brugeren. */
  description?: string;
  /** Tungeste sæt-PR. */
  prWeight?: number;
  prReps?: number;
  prDate?: string;
  /** 1RM-PR, indtastet manuelt af brugeren (ikke beregnet). */
  pr1RM?: number;
  pr1RMDate?: string;
  /** Markeret som favorit i øvelsesbiblioteket. */
  favorite?: boolean;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  startedAt: string;
  endedAt?: string;
  durationMin?: number;
  notes?: string;
}

export type SetType = "normal" | "warmup" | "dropset" | "1rm";

export interface SetEntry {
  id: string;
  sessionId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  setType: SetType;
  order: number;
  createdAt: string;
}

export interface CardioEntry {
  id: string;
  date: string;
  activity: string;
  distanceKm: number;
  durationMin: number;
  notes?: string;
}

/** De kropsmål appen kender. Lukket liste frem for fritekst, som øvelseskategorier og cardio-typer. */
export const BODY_MEASUREMENTS = ["Talje", "Bryst", "Arm", "Lår", "Hofte"] as const;
export type BodyMeasurement = (typeof BODY_MEASUREMENTS)[number];

export interface BodyweightEntry {
  id: string;
  date: string;
  weight: number;
  /** Omkredse i cm, kun dem der er målt. Manglende felt = ingen mål — ingen migration nødvendig. */
  measurements?: Partial<Record<BodyMeasurement, number>>;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  /**
   * Billedet som data-URL frem for Blob: backuppen er JSON, og JSON.stringify smider en Blob
   * væk uden at sige noget. Billedet skaleres ned før det gemmes, så filen ikke eksploderer.
   */
  dataUrl: string;
  note?: string;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
  color?: string;
  /** Markeret som favorit af brugeren. IndexedDB er skemaløst, så feltet kræver ingen migration. */
  favorite?: boolean;
  /**
   * Øvelser der køres som supersæt, som par af id'er. En øvelse kan kun stå i ét par.
   * Manglende felt betyder "ingen supersæt" — gamle programmer kræver derfor ingen migration.
   */
  supersets?: string[][];
  createdAt: string;
}

/**
 * Hvor en planlagt træning endte. Manglende værdi betyder "planned" — alle planer lagt
 * før feltet fandtes, læses altså som planlagte, uden migration.
 */
export type PlannedStatus = "planned" | "done" | "postponed" | "skipped";

export interface PlannedWorkout {
  id: string;
  date: string;
  routineId?: string;
  exerciseIds: string[];
  status?: PlannedStatus;
}

export type GoalType =
  | "sessionsPerWeek"
  | "distanceKmPerWeek"
  | "bodyweight"
  | "exerciseWeight"
  | "exercise1RM";

export interface Goal {
  id: string;
  type: GoalType;
  target: number;
  /** Krævet for exerciseWeight/exercise1RM. */
  exerciseId?: string;
  /** Baseline ved oprettelse, bruges til procent-udregning på bodyweight-mål. */
  startValue?: number;
  createdAt: string;
}

export interface Quote {
  id: string;
  text: string;
  /** Med i rotationen på Oversigt og i kalenderen. */
  starred: boolean;
  createdAt: string;
}
