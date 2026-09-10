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

export interface BodyweightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
  color?: string;
  /** Markeret som favorit af brugeren. IndexedDB er skemaløst, så feltet kræver ingen migration. */
  favorite?: boolean;
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
