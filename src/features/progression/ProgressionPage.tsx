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
import { IconTrophy } from "../../components/icons";
import { StrengthGainList } from "../../components/StrengthGainList";
import { listExercises } from "../../db/exercises";
import { listAllSets } from "../../db/sets";
import { chartAxisTick, chartTooltipStyle } from "../../lib/chart";
import { formatShortDate } from "../../lib/date";
import { buildStrengthGains, groupSetsByExercise } from "../../lib/strengthGains";
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
  const [allSets, setAllSets] = useState<SetEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([listExercises(), listAllSets()]).then(([exerciseList, setList]) => {
      setExercises(exerciseList);
      setAllSets(setList);
      setLoading(false);
    });
  }, []);

  const setsByExercise = useMemo(() => groupSetsByExercise(allSets), [allSets]);

  const sortedExercises = useMemo(
    () =>
      [...exercises].sort((a, b) => {
        const diff = (setsByExercise.get(b.id)?.length ?? 0) - (setsByExercise.get(a.id)?.length ?? 0);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }),
    [exercises, setsByExercise],
  );

  useEffect(() => {
    if (selectedId || sortedExercises.length === 0) return;
    setSelectedId(sortedExercises[0].id);
  }, [sortedExercises, selectedId]);

  const strengthGains = useMemo(
    () => buildStrengthGains(exercises, setsByExercise).sort((a, b) => b.percent - a.percent),
    [exercises, setsByExercise],
  );
  const avgGainPercent = useMemo(() => {
    if (strengthGains.length === 0) return undefined;
    const sum = strengthGains.reduce((acc, g) => acc + g.percent, 0);
    return Math.round((sum / strengthGains.length) * 10) / 10;
  }, [strengthGains]);

  const dailyStats = useMemo(
    () => buildDailyStats(setsByExercise.get(selectedId ?? "") ?? []),
    [setsByExercise, selectedId],
  );
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
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-(--color-text)">Progression</h1>
        <p className="text-[13px] text-(--color-text-secondary)">
          Synlige fremskridt. Reelle resultater.
        </p>
      </div>

      {strengthGains.length > 0 && avgGainPercent !== undefined && (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Styrke-fremgang
            </span>
            <span
              className={`text-[15px] font-semibold ${
                avgGainPercent >= 0 ? "text-(--color-accent-glow)" : "text-(--color-text-muted)"
              }`}
            >
              {avgGainPercent > 0 ? "+" : ""}
              {avgGainPercent}% i gennemsnit
            </span>
          </div>
          <span className="text-[11px] text-(--color-text-muted)">
            Fra din første logning til nu (PR), pr. øvelse — ikke bundet til en bestemt periode
          </span>
          <StrengthGainList gains={strengthGains} className="max-h-64 overflow-y-auto pr-1 pt-1" />
        </div>
      )}

      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {sortedExercises.map((exercise) => (
          <button
            key={exercise.id}
            type="button"
            onClick={() => setSelectedId(exercise.id)}
            className={`min-h-9 flex-shrink-0 rounded-full px-3.5 text-[13px] font-medium ${
              selectedId === exercise.id
                ? "accent-fill text-(--color-text)"
                : "bg-(--color-surface-2) text-(--color-text-muted)"
            }`}
          >
            {exercise.name}
          </button>
        ))}
      </div>

      {selectedExercise &&
        (selectedExercise.prWeight !== undefined || selectedExercise.prReps !== undefined) && (
          <div className="accent-glow-ring flex items-center justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
            <span className="flex items-center gap-2 text-[13px] font-medium text-(--color-text-muted)">
              <IconTrophy className="h-4 w-4 text-(--color-accent-bright)" />
              Nuværende PR
            </span>
            <span className="text-[15px] font-semibold text-(--color-accent-glow)">
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
          <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
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
                    stroke="var(--color-accent-bright)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--color-accent-bright)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
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
                  <Bar dataKey="volume" fill="var(--color-accent-glow)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
