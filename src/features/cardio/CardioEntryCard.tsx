import { useState } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { formatMediumDate, parseISODate } from "../../lib/date";
import { formatPace } from "../../lib/format";
import type { CardioEntry } from "../../types";

type CardioEntryUpdate = Partial<
  Pick<CardioEntry, "date" | "activity" | "distanceKm" | "durationMin">
>;

interface CardioEntryCardProps {
  entry: CardioEntry;
  onUpdate: (changes: CardioEntryUpdate) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function CardioEntryCard({ entry, onUpdate, onDelete }: CardioEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [activity, setActivity] = useState(entry.activity);
  const [distanceKm, setDistanceKm] = useState(entry.distanceKm.toString());
  const [durationMin, setDurationMin] = useState(entry.durationMin.toString());

  async function handleSave() {
    const distanceValue = Number(distanceKm);
    const durationValue = Number(durationMin);
    if (!activity.trim() || !distanceValue || !durationValue) return;
    await onUpdate({
      date,
      activity: activity.trim(),
      distanceKm: distanceValue,
      durationMin: durationValue,
    });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm("Slet denne løbetur? Dette kan ikke fortrydes.")) {
      void onDelete();
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <TextField
          label="Dato"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField
          label="Aktivitet"
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Distance (km)"
            type="number"
            inputMode="decimal"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
          <TextField
            label="Tid (min)"
            type="number"
            inputMode="numeric"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave}>Gem</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-medium text-(--color-text)">
          {formatMediumDate(parseISODate(entry.date))} · {entry.activity}
        </span>
        <span className="text-[13px] text-(--color-text-muted)">
          {entry.distanceKm} km · {entry.durationMin} min ·{" "}
          {formatPace(entry.distanceKm, entry.durationMin)}
        </span>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="Redigér"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-surface-2) text-(--color-text) active:opacity-70"
        >
          ✎
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Slet"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-danger)/15 text-(--color-danger) active:opacity-70"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
