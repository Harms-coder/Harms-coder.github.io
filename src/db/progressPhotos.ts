import { generateId } from "../lib/id";
import type { ProgressPhoto } from "../types";
import { getDb } from "./database";

/*
 * Fremgangsfotos. Et telefonfoto fylder flere megabyte, og billederne skal både ligge i
 * IndexedDB og med i JSON-backuppen — derfor skaleres og komprimeres de kraftigt, før de
 * gemmes. 1080 px på den lange led er rigeligt til at se en forskel på kroppen.
 */
const MAX_EDGE = 1080;
const JPEG_QUALITY = 0.72;

export async function listProgressPhotos(): Promise<ProgressPhoto[]> {
  const db = await getDb();
  const all = await db.getAllFromIndex("progressPhotos", "by-date");
  return all.reverse();
}

/** Skalerer billedet ned og gør det til en JPEG data-URL. */
export async function shrinkToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kunne ikke behandle billedet");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export async function createProgressPhoto(input: {
  date: string;
  dataUrl: string;
  note?: string;
}): Promise<ProgressPhoto> {
  const db = await getDb();
  const photo: ProgressPhoto = {
    id: generateId(),
    date: input.date,
    dataUrl: input.dataUrl,
    note: input.note?.trim() || undefined,
  };
  await db.add("progressPhotos", photo);
  return photo;
}

export async function deleteProgressPhoto(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("progressPhotos", id);
}
