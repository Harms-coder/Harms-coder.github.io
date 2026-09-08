import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { listExercises } from "../../db/exercises";
import { listSetsForExercise } from "../../db/sets";
import { chartAxisTick, chartTooltipStyle } from "../../lib/chart";
import { formatShortDate } from "../../lib/date";
import type { Exercise, SetEntry } from "../../types";

interface DailyStat {
  date: string;
  label: string;
  maxWeight: number;
  volume: number;
}

function buildDailyStats(sets: SetEntry[]): DailyStat[] {
  const byDate = new Map<string, SetEntry[]>();
  for (const set of sets) {
    if (set.setType === "warmup") continue;
    const date = set.createdAt.slice(0, 10);
    const list = byDate.get(date) ?? [];
    list.push(set);
    byDate.set(date, list);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, daySets]) => ({
      date,
      label: formatShortDate(date),
      maxWeight: Math.max(...daySets.map((s) => s.weight)),
      volume: daySets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    }));
}

export function ProgressionPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExercises() {
    const all = await listExercises();
    setExercises(all);
    setSelectedId(all[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadExercises();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSets([]);
      return;
    }
    void listSetsForExercise(selectedId).then(setSets);
  }, [selectedId]);

  const dailyStats = useMemo(() => buildDailyStats(sets), [sets]);
  const selectedExercise = exercises.find((e) => e.id === selectedId);

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col gap-2 px-4 pt-6">
        <h1 className="text-2xl font-semibold text-(--color-text)">Progression</h1>
        <p className="text-sm text-(--color-text-muted)">
          Opret øvelser og log nogle sæt for at se din udvikling her.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">Progression</h1>

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {exercises.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => setSelectedId(exercise.id)}
            className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
              selectedId === exercise.id
                ? "bg-(--color-accent) text-white"
                : "bg-(--color-surface-2) text-(--color-text-muted)"
            }`}
          >
            {exercise.name}
          </button>
        ))}
      </div>

      {selectedExercise &&
        (selectedExercise.prWeight !== undefined || selectedExercise.prReps !== undefined) && (
          <div className="flex items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Nuværende PR
            </span>
            <span className="text-[15px] font-semibold text-(--color-accent-green)">
              {selectedExercise.prWeight} kg × {selectedExercise.prReps}
            </span>
          </div>
        )}

      {dailyStats.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          Ingen sæt logget endnu for denne øvelse.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Tungeste vægt pr. træning (kg)
            </span>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--color-text)" }} />
                  <Line
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-accent)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Volume pr. træning (kg × reps)
            </span>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                  <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--color-text)" }} />
                  <Bar dataKey="volume" fill="var(--color-accent-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
