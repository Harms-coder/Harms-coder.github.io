import { listExercises } from "./exercises";
import { listSessions } from "./sessions";
import { listAllSets } from "./sets";
import { todayISODate } from "../lib/date";
import type { SetType } from "../types";

const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Normal",
  warmup: "Varm op",
  dropset: "Drop sæt",
  "1rm": "1RM",
};

const HEADERS = ["Dato", "Øvelse", "Kategori", "Kg", "Gentagelser", "Type", "Volumen (kg)"];

/*
 * Semikolon som skilletegn og komma som decimaltegn: det er hvad et dansk Excel og Numbers
 * forventer. Med komma-skilletegn og punktum-decimaler havner hele rækken i én kolonne.
 */
const SEPARATOR = ";";

function escapeField(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function number(value: number): string {
  return String(Math.round(value * 100) / 100).replace(".", ",");
}

export function csvFilename(): string {
  return `vigorra-saet-${todayISODate()}.csv`;
}

/** Én række pr. sæt, nyeste sidst. */
export async function buildSetsCsv(): Promise<{ csv: string; rowCount: number }> {
  const [sets, exercises, sessions] = await Promise.all([
    listAllSets(),
    listExercises(),
    listSessions(),
  ]);
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  /* Træningens dato frem for sættets tidsstempel, så et sæt logget efter midnat hører til
     den træning det var en del af. */
  const dateBySession = new Map(sessions.map((s) => [s.id, s.date]));

  const rows = [...sets]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((set) => {
      const exercise = exerciseById.get(set.exerciseId);
      return [
        dateBySession.get(set.sessionId) ?? set.createdAt.slice(0, 10),
        exercise?.name ?? "Slettet øvelse",
        exercise?.category ?? "",
        number(set.weight),
        String(set.reps),
        SET_TYPE_LABELS[set.setType],
        number(set.weight * set.reps),
      ]
        .map(escapeField)
        .join(SEPARATOR);
    });

  /* BOM foran, ellers viser Excel på Windows æ, ø og å som volapyk. */
  const csv = `﻿${[HEADERS.join(SEPARATOR), ...rows].join("\r\n")}\r\n`;
  return { csv, rowCount: rows.length };
}
