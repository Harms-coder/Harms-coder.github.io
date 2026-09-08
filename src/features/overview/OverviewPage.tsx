import { useEffect, useMemo, useState } from "react";
import { Sparkline } from "../../components/Sparkline";
import { StatTile } from "../../components/StatTile";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listSessionsInRange } from "../../db/sessions";
import { toISODate, todayISODate } from "../../lib/date";
import type { BodyweightEntry, CardioEntry, WorkoutSession } from "../../types";

type RangeKey = "week" | "month" | "year";

const RANGE_LABELS: Record<RangeKey, string> = {
  week: "Uge",
  month: "Måned",
  year: "År",
};

const RANGE_DAYS: Record<RangeKey, number> = {
  week: 7,
  month: 30,
  year: 365,
};

function getRangeStart(range: RangeKey): string {
  const start = new Date();
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return toISODate(start);
}

export function OverviewPage() {
  const [range, setRange] = useState<RangeKey>("week");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [cardioEntries, setCardioEntries] = useState<CardioEntry[]>([]);
  const [bodyweightEntries, setBodyweightEntries] = useState<BodyweightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const start = getRangeStart(range);
    const end = todayISODate();
    const [rangeSessions, rangeCardio, allBodyweight] = await Promise.all([
      listSessionsInRange(start, end),
      listCardioEntriesInRange(start, end),
      listBodyweightEntries(),
    ]);
    setSessions(rangeSessions.filter((session) => session.endedAt));
    setCardioEntries(rangeCardio);
    setBodyweightEntries(allBodyweight);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [range]);

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const totalCardioKm = cardioEntries.reduce((sum, c) => sum + c.distanceKm, 0);
  const rangeStart = getRangeStart(range);

  const weightInRange = useMemo(
    () =>
      [...bodyweightEntries]
        .filter((entry) => entry.date >= rangeStart)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bodyweightEntries, rangeStart],
  );
  const latestWeight = bodyweightEntries[0];
  const firstWeightInRange = weightInRange[0];
  const weightChange =
    latestWeight && firstWeightInRange && weightInRange.length >= 2
      ? Math.round((latestWeight.weight - firstWeightInRange.weight) * 10) / 10
      : undefined;

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">Oversigt</h1>

      <div className="flex gap-2">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`min-h-9 flex-1 rounded-full text-[13px] font-medium ${
              range === key
                ? "bg-(--color-accent) text-white"
                : "bg-(--color-surface-2) text-(--color-text-muted)"
            }`}
          >
            {RANGE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Træninger" value={`${sessions.length}`} />
        <StatTile label="Minutter" value={`${totalMinutes}`} />
        <StatTile label="Løbeture" value={`${cardioEntries.length}`} />
        <StatTile label="Km løbet" value={totalCardioKm.toFixed(1)} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-(--color-text-muted)">Kropsvægt</span>
          {latestWeight && (
            <span className="text-[15px] font-semibold text-(--color-text)">
              {latestWeight.weight} kg
            </span>
          )}
        </div>

        {weightInRange.length >= 2 ? (
          <>
            <Sparkline values={weightInRange.map((entry) => entry.weight)} />
            {weightChange !== undefined && (
              <span
                className={`text-[13px] font-medium ${
                  weightChange <= 0 ? "text-(--color-accent-green)" : "text-(--color-text-muted)"
                }`}
              >
                {weightChange > 0 ? "+" : ""}
                {weightChange} kg i denne periode
              </span>
            )}
          </>
        ) : (
          <p className="text-[13px] text-(--color-text-muted)">
            Log din vægt et par gange for at se udviklingen her.
          </p>
        )}
      </div>
    </div>
  );
}
