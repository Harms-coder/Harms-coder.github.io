import { useState } from "react";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { TextField } from "../../components/TextField";
import { formatMediumDate, parseISODate } from "../../lib/date";
import { BODY_MEASUREMENTS, type BodyweightEntry } from "../../types";

interface BodyweightEntryCardProps {
  entry: BodyweightEntry;
  onUpdate: (changes: { date: string; weight: number }) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function BodyweightEntryCard({ entry, onUpdate, onDelete }: BodyweightEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(entry.date);
  const [weight, setWeight] = useState(entry.weight.toString());

  async function handleSave() {
    const weightValue = Number(weight);
    if (!weightValue) return;
    await onUpdate({ date, weight: weightValue });
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm("Slet denne måling? Dette kan ikke fortrydes.")) {
      void onDelete();
    }
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Dato"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <TextField
            label="Vægt (kg)"
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
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

  /* Kun de mål der faktisk er taget — rækkefølgen følger BODY_MEASUREMENTS, så kortene ser ens ud. */
  const measured = BODY_MEASUREMENTS.flatMap((name) => {
    const value = entry.measurements?.[name];
    return value === undefined ? [] : [[name, value] as const];
  });

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-medium text-(--color-text)">{entry.weight} kg</span>
        <span className="text-[13px] text-(--color-text-muted)">
          {formatMediumDate(parseISODate(entry.date))}
        </span>
        {measured.length > 0 && (
          <span className="text-[12.5px] text-(--color-text-secondary)">
            {measured.map(([name, value]) => `${name} ${value} cm`).join(" · ")}
          </span>
        )}
      </div>
      <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
    </div>
  );
}
