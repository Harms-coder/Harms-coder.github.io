import { useEffect, useRef, useState } from "react";
import { IconCamera, IconTrash } from "../../components/icons";
import {
  createProgressPhoto,
  deleteProgressPhoto,
  listProgressPhotos,
  shrinkToDataUrl,
} from "../../db/progressPhotos";
import { formatMediumDate, parseISODate, todayISODate } from "../../lib/date";
import type { ProgressPhoto } from "../../types";

/**
 * Fremgangsfotos. Billederne ligger i appens egen database og kommer med i backuppen —
 * de forlader aldrig telefonen af sig selv. Vises nyeste først, så man ser forskellen
 * mod det ældste billede ved at rulle til enden.
 */
export function ProgressPhotos() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [zoomed, setZoomed] = useState<ProgressPhoto | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    setPhotos(await listProgressPhotos());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleFile(file: File) {
    setBusy(true);
    setError(undefined);
    try {
      const dataUrl = await shrinkToDataUrl(file);
      await createProgressPhoto({ date: todayISODate(), dataUrl });
      await refresh();
    } catch {
      setError("Kunne ikke gemme billedet. Prøv et andet.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleDelete(photo: ProgressPhoto) {
    if (!window.confirm(`Slet billedet fra ${formatMediumDate(parseISODate(photo.date))}?`)) return;
    await deleteProgressPhoto(photo.id);
    setZoomed(null);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-(--color-text-muted)">Fremgangsfotos</span>
        <span className="text-[12.5px] text-(--color-text-muted)">
          {photos.length === 0
            ? "Ingen endnu"
            : `${photos.length} ${photos.length === 1 ? "billede" : "billeder"}`}
        </span>
      </div>

      {photos.length > 0 && (
        <div className="no-scrollbar glow-scroller glow-scroller-x flex gap-2 overflow-x-auto">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setZoomed(photo)}
              className="flex flex-shrink-0 flex-col gap-1"
            >
              <img
                src={photo.dataUrl}
                alt={`Fremgangsfoto fra ${formatMediumDate(parseISODate(photo.date))}`}
                className="h-32 w-24 rounded-xl border border-(--color-border) object-cover"
              />
              <span className="text-[11px] text-(--color-text-muted)">
                {formatMediumDate(parseISODate(photo.date))}
              </span>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        className="flex min-h-11 items-center justify-center gap-2 rounded-xl glass-fill text-[14px] font-medium text-(--color-text) active:opacity-70 disabled:opacity-50"
      >
        <IconCamera className="h-4 w-4" />
        {busy ? "Gemmer…" : "Tilføj billede"}
      </button>
      {error && <span className="text-[12.5px] text-(--color-danger)">{error}</span>}
      <span className="text-[12px] text-(--color-text-muted)">
        Billederne gemmes kun på denne telefon og kommer med i backuppen.
      </span>

      {zoomed && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/85 p-6"
          onClick={() => setZoomed(null)}
        >
          <img
            src={zoomed.dataUrl}
            alt=""
            className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
          />
          <span className="text-[13px] text-(--color-text-secondary)">
            {formatMediumDate(parseISODate(zoomed.date))}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete(zoomed);
            }}
            className="flex min-h-11 items-center gap-2 rounded-xl glass-fill px-4 text-[14px] font-medium text-(--color-danger) active:opacity-70"
          >
            <IconTrash className="h-4 w-4" />
            Slet billede
          </button>
        </div>
      )}
    </div>
  );
}
