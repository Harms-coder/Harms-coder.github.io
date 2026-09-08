export interface Exercise {
  id: string;
  name: string;
  category?: string;
  prWeight?: number;
  prReps?: number;
  prDate?: string;
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

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  note?: string;
}
