import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  BodyweightEntry,
  CardioEntry,
  Exercise,
  Goal,
  PlannedWorkout,
  ProgressPhoto,
  Quote,
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
  quotes: {
    key: string;
    value: Quote;
  };
  progressPhotos: {
    key: string;
    value: ProgressPhoto;
    indexes: { "by-date": string };
  };
}

const DB_NAME = "traeningsapp";
export const DB_VERSION = 5;

/**
 * Fyres på window ("db-changed") når en skrivende transaktion er færdig. PageSwiper bruger det til
 * at smide sine forudindlæste nabosider væk, så de aldrig viser gamle tal.
 * ponytail: patcher IDBDatabase.prototype globalt i stedet for at kalde notify() i ~40 skrivefunktioner —
 * flyt til et eksplicit kald pr. modul, hvis appen nogensinde får en anden IndexedDB-bruger.
 */
export const DB_CHANGED_EVENT = "db-changed";
const originalTransaction = IDBDatabase.prototype.transaction;
IDBDatabase.prototype.transaction = function (this: IDBDatabase, ...args: Parameters<typeof originalTransaction>) {
  const tx = originalTransaction.apply(this, args);
  if (tx.mode === "readwrite") {
    tx.addEventListener("complete", () => window.dispatchEvent(new Event(DB_CHANGED_EVENT)));
  }
  return tx;
};

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

        if (oldVersion < 4) {
          db.createObjectStore("quotes", { keyPath: "id" });
        }

        if (oldVersion < 5) {
          const photos = db.createObjectStore("progressPhotos", { keyPath: "id" });
          photos.createIndex("by-date", "date");
        }
      },
    });
  }
  return dbPromise;
}
