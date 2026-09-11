import { DB_VERSION, getDb } from "./database";
import { forgetSeedFlags } from "./exerciseSeed";
import { forgetQuoteSeedFlag } from "./quotes";

/** Alle stores i databasen. En backup skal indeholde dem alle for at være en fuld kopi. */
const STORES = [
  "exercises",
  "workoutSessions",
  "sets",
  "cardioEntries",
  "bodyweightEntries",
  "routines",
  "plannedWorkouts",
  "goals",
  "quotes",
] as const;

type StoreName = (typeof STORES)[number];

export interface BackupFile {
  app: "traeningsapp";
  /** Databaseversionen filen blev skrevet med — en nyere fil kan ikke læses af en ældre app. */
  dbVersion: number;
  exportedAt: string;
  data: Record<string, { id: string }[]>;
}

export async function createBackup(): Promise<BackupFile> {
  const db = await getDb();
  const data: Record<string, { id: string }[]> = {};
  for (const store of STORES) {
    data[store] = (await db.getAll(store)) as { id: string }[];
  }
  return {
    app: "traeningsapp",
    dbVersion: DB_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function countRecords(backup: BackupFile): number {
  return Object.values(backup.data).reduce((sum, rows) => sum + rows.length, 0);
}

/**
 * Validerer en indlæst fil, før noget som helst skrives. Filen kommer udefra og er
 * derfor upålidelig — alt der ikke er genkendt, afvises frem for at blive gættet på.
 * Returnerer en fejlbesked på dansk, eller undefined hvis filen er i orden.
 */
export function validateBackup(value: unknown): { error?: string; backup?: BackupFile } {
  if (typeof value !== "object" || value === null) {
    return { error: "Filen er ikke en gyldig backup." };
  }
  const candidate = value as Partial<BackupFile>;
  if (candidate.app !== "traeningsapp") {
    return { error: "Filen er ikke en backup fra denne app." };
  }
  if (typeof candidate.dbVersion !== "number") {
    return { error: "Filen mangler versionsnummer og kan ikke læses." };
  }
  if (candidate.dbVersion > DB_VERSION) {
    return {
      error: `Filen er lavet med en nyere version af appen (v${candidate.dbVersion} mod v${DB_VERSION}). Opdatér appen først.`,
    };
  }
  if (typeof candidate.data !== "object" || candidate.data === null) {
    return { error: "Filen indeholder ingen data." };
  }

  for (const store of STORES) {
    const rows = candidate.data[store];
    if (rows === undefined) continue;
    if (!Array.isArray(rows)) {
      return { error: `Feltet "${store}" i filen har et forkert format.` };
    }
    if (rows.some((row) => typeof row !== "object" || row === null || typeof row.id !== "string")) {
      return { error: `En eller flere poster i "${store}" mangler et gyldigt id.` };
    }
  }

  return { backup: candidate as BackupFile };
}

/**
 * Erstatter indholdet af databasen med filens. Kører som én transaktion over alle stores,
 * så en gendannelse enten lykkes helt eller slet ikke — man ender aldrig med halvdelen af
 * sin gamle historik og halvdelen af sin nye.
 */
export async function restoreBackup(backup: BackupFile): Promise<number> {
  const db = await getDb();
  const tx = db.transaction(STORES, "readwrite");
  let restored = 0;

  for (const store of STORES) {
    const rows = backup.data[store];
    if (!rows) continue;
    const objectStore = tx.objectStore(store as StoreName);
    await objectStore.clear();
    for (const row of rows) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await objectStore.put(row as any);
      restored++;
    }
  }

  await tx.done;
  return restored;
}

/**
 * Tømmer alle stores. Modstykket til eksempeldata-siden, som kun kan lægge data oven i.
 * Én transaktion, så appen aldrig står med halvdelen slettet.
 */
export async function clearAllData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORES, "readwrite");
  await Promise.all([...STORES.map((store) => tx.objectStore(store).clear()), tx.done]);
  // Ellers ville appen stå helt uden øvelser og citater: seedingen kører kun én gang nogensinde.
  forgetSeedFlags();
  forgetQuoteSeedFlag();
}
