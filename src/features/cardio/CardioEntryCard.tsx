import { useState, type CSSProperties } from "react";
import { ActivityPicker } from "../../components/ActivityPicker";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { IconActivity, IconRun, type IconComponent } from "../../components/icons";
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

/** Løb/gang får løbe-silhuetten; øvrige aktiviteter deler det generiske aktivitets-ikon. */
const ACTIVITY_ICONS: Record<string, IconComponent> = { Løb: IconRun, Gang: IconRun };

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
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <TextField
          label="Dato"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <span className="text-[13px] font-medium text-(--color-text-muted)">Aktivitet</span>
        <ActivityPicker value={activity} onChange={setActivity} />
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
          <Button tone="cardio" onClick={handleSave}>
            Gem
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      </div>
    );
  }

  const Icon = ACTIVITY_ICONS[entry.activity] ?? IconActivity;

  return (
    <div className="flex min-h-20 items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span
        className="cat-badge flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
        style={{ "--badge-color": "var(--color-cat-cardio)" } as CSSProperties}
      >
        <Icon className="h-[22px] w-[22px] text-(--color-cat-cardio)" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[15px] font-medium text-(--color-text)">
          {formatMediumDate(parseISODate(entry.date))} · {entry.activity}
        </span>
        <span className="text-[13px] text-(--color-text-muted)">
          <span className="font-medium text-(--color-cat-cardio)">{entry.distanceKm} km</span> ·{" "}
          {entry.durationMin} min · {formatPace(entry.distanceKm, entry.durationMin)}
        </span>
      </div>
      <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
    </div>
  );
}
