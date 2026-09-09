import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ActivityPicker } from "../../components/ActivityPicker";
import { Button } from "../../components/Button";
import { HeroHeader } from "../../components/HeroHeader";
import { IconClock, IconMapPin, IconRun } from "../../components/icons";
import { MetricCard } from "../../components/MetricCard";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextField } from "../../components/TextField";
import {
  CARDIO_ACTIVITIES,
  createCardioEntry,
  deleteCardioEntry,
  listCardioEntries,
  updateCardioEntry,
} from "../../db/cardio";
import { todayISODate } from "../../lib/date";
import type { CardioEntry } from "../../types";
import { CardioEntryCard } from "./CardioEntryCard";

const FILTER_ALL = "Alle";
const FILTER_OPTIONS = [FILTER_ALL, ...CARDIO_ACTIVITIES].map((activity) => ({
  value: activity,
  label: activity,
}));

export function CardioPage() {
  const [entries, setEntries] = useState<CardioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>(FILTER_ALL);
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

  const filteredEntries = useMemo(
    () => (activityFilter === FILTER_ALL ? entries : entries.filter((e) => e.activity === activityFilter)),
    [entries, activityFilter],
  );

  const monthStats = useMemo(() => {
    const monthKey = todayISODate().slice(0, 7);
    const thisMonth = entries.filter((e) => e.date.slice(0, 7) === monthKey);
    return {
      km: Math.round(thisMonth.reduce((sum, e) => sum + e.distanceKm, 0) * 10) / 10,
      count: thisMonth.length,
      minutes: thisMonth.reduce((sum, e) => sum + e.durationMin, 0),
    };
  }, [entries]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <HeroHeader
        title="Cardio"
        subtitle="Find dit tempo. Kom længere."
        image="/images/cardio-runner.jpg"
        imagePosition="center 55%"
        action={
          <Button
            variant={isAdding ? "secondary" : "primary"}
            onClick={() => setIsAdding((v) => !v)}
          >
            {isAdding ? "Annuller" : "+ Tilføj"}
          </Button>
        }
      />

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow"
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

      <SegmentedControl
        options={FILTER_OPTIONS}
        value={activityFilter}
        onChange={setActivityFilter}
        layout="scroll"
      />

      <div className="flex gap-3">
        <MetricCard icon={IconMapPin} value={`${monthStats.km} km`} label="Denne måned" />
        <MetricCard icon={IconRun} value={`${monthStats.count}`} label="Løbeture" />
        <MetricCard icon={IconClock} value={`${monthStats.minutes} min`} label="Total tid" />
      </div>

      <span className="text-[13px] font-medium text-(--color-text-muted)">Seneste træninger</span>

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && entries.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen cardio-log endnu. Tryk "+ Tilføj" for at logge din første løbetur.
        </p>
      )}

      {!loading && entries.length > 0 && filteredEntries.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Ingen træninger matcher "{activityFilter}".
        </p>
      )}

      <div className="flex flex-col gap-3">
        {filteredEntries.map((entry) => (
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
