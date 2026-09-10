import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  BodyweightEntry,
  CardioEntry,
  Exercise,
  Goal,
  PlannedWorkout,
  Routine,
  SetEntry,
  WorkoutSession,
} from "../types";

interface TraeningsappDB extends DBSchema {
  exercises: {
    key: string;
    value: Exercise;
    indexes: { "by-name": string };
  };
  workoutSessions: {
    key: string;
    value: WorkoutSession;
    indexes: { "by-date": string };
  };
  sets: {
    key: string;
    value: SetEntry;
    indexes: { "by-session": string; "by-exercise": string };
  };
  cardioEntries: {
    key: string;
    value: CardioEntry;
    indexes: { "by-date": string };
  };
  bodyweightEntries: {
    key: string;
    value: BodyweightEntry;
    indexes: { "by-date": string };
  };
  routines: {
    key: string;
    value: Routine;
  };
  plannedWorkouts: {
    key: string;
    value: PlannedWorkout;
    indexes: { "by-date": string };
  };
  goals: {
    key: string;
    value: Goal;
  };
}

const DB_NAME = "traeningsapp";
export const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<TraeningsappDB>> | undefined;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<TraeningsappDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const exercises = db.createObjectStore("exercises", { keyPath: "id" });
          exercises.createIndex("by-name", "name");

          const sessions = db.createObjectStore("workoutSessions", { keyPath: "id" });
          sessions.createIndex("by-date", "date");

          const sets = db.createObjectStore("sets", { keyPath: "id" });
          sets.createIndex("by-session", "sessionId");
          sets.createIndex("by-exercise", "exerciseId");

          const cardio = db.createObjectStore("cardioEntries", { keyPath: "id" });
          cardio.createIndex("by-date", "date");

          const bodyweight = db.createObjectStore("bodyweightEntries", { keyPath: "id" });
          bodyweight.createIndex("by-date", "date");
        }

        if (oldVersion < 2) {
          db.createObjectStore("routines", { keyPath: "id" });

          const plannedWorkouts = db.createObjectStore("plannedWorkouts", { keyPath: "id" });
          plannedWorkouts.createIndex("by-date", "date");
        }

        if (oldVersion < 3) {
          db.createObjectStore("goals", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}
