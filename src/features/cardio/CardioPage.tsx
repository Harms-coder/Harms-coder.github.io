import { useEffect, useState, type FormEvent } from "react";
import { ActivityPicker } from "../../components/ActivityPicker";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import {
  createCardioEntry,
  deleteCardioEntry,
  listCardioEntries,
  updateCardioEntry,
} from "../../db/cardio";
import { todayISODate } from "../../lib/date";
import type { CardioEntry } from "../../types";
import { CardioEntryCard } from "./CardioEntryCard";

export function CardioPage() {
  const [entries, setEntries] = useState<CardioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [date, setDate] = useState(todayISODate());
  const [activity, setActivity] = useState("Løb");
  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");

  async function refresh() {
    const all = await listCardioEntries();
    setEntries(all);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    const distanceValue = Number(distanceKm);
    const durationValue = Number(durationMin);
    if (!activity.trim() || !distanceValue || !durationValue) return;
    await createCardioEntry({
      date,
      activity,
      distanceKm: distanceValue,
      durationMin: durationValue,
    });
    setDate(todayISODate());
    setActivity("Løb");
    setDistanceKm("");
    setDurationMin("");
    setIsAdding(false);
    await refresh();
  }

  async function handleUpdate(
    id: string,
    changes: Parameters<typeof updateCardioEntry>[1],
  ) {
    await updateCardioEntry(id, changes);
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteCardioEntry(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--color-text)">Cardio</h1>
        <Button
          variant={isAdding ? "secondary" : "primary"}
          onClick={() => setIsAdding((v) => !v)}
        >
          {isAdding ? "Annuller" : "+ Tilføj"}
        </Button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
        >
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
              placeholder="5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
            />
            <TextField
              label="Tid (min)"
              type="number"
              inputMode="numeric"
              placeholder="30"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
            />
          </div>
          <Button type="submit">Gem løbetur</Button>
        </form>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && entries.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen cardio-log endnu. Tryk "+ Tilføj" for at logge din første løbetur.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <CardioEntryCard
            key={entry.id}
            entry={entry}
            onUpdate={(changes) => handleUpdate(entry.id, changes)}
            onDelete={() => handleDelete(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}
