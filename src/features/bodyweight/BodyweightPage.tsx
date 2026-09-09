import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../components/Button";
import { PageBackdrop } from "../../components/PageBackdrop";
import { TextField } from "../../components/TextField";
import {
  createBodyweightEntry,
  deleteBodyweightEntry,
  listBodyweightEntries,
  updateBodyweightEntry,
} from "../../db/bodyweight";
import { chartAxisTick, chartTooltipStyle } from "../../lib/chart";
import { formatShortDate, todayISODate } from "../../lib/date";
import type { BodyweightEntry } from "../../types";
import { BodyweightEntryCard } from "./BodyweightEntryCard";

export function BodyweightPage() {
  const [entries, setEntries] = useState<BodyweightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISODate());
  const [weight, setWeight] = useState("");

  async function refresh() {
    const all = await listBodyweightEntries();
    setEntries(all);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    const weightValue = Number(weight);
    if (!weightValue) return;
    await createBodyweightEntry({ date, weight: weightValue });
    setWeight("");
    setDate(todayISODate());
    await refresh();
  }

  async function handleUpdate(
    id: string,
    changes: Parameters<typeof updateBodyweightEntry>[1],
  ) {
    await updateBodyweightEntry(id, changes);
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteBodyweightEntry(id);
    await refresh();
  }

  const chartData = useMemo(
    () =>
      [...entries]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({
          date: entry.date,
          label: formatShortDate(entry.date),
          weight: entry.weight,
        })),
    [entries],
  );

  const stats = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const weights = chartData.map((d) => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    return { min, max, avg: Math.round(avg * 10) / 10 };
  }, [chartData]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/kropsvaegt-sunset.jpg" imagePosition="center 45%" />
      <h1 className="text-2xl font-semibold text-(--color-text)">Kropsvægt</h1>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow"
      >
        <span className="text-[13px] font-medium text-(--color-text-muted)">Log kropsvægt</span>
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
            placeholder="82,4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <Button type="submit">Gem</Button>
      </form>

      {chartData.length > 1 && stats && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <span className="text-[13px] font-medium text-(--color-text-muted)">Udvikling</span>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col rounded-xl bg-(--color-surface-2) px-3 py-2">
              <span className="text-[11px] text-(--color-text-muted)">Laveste</span>
              <span className="text-[15px] font-semibold text-(--color-text)">{stats.min} kg</span>
            </div>
            <div className="flex flex-col rounded-xl bg-(--color-surface-2) px-3 py-2">
              <span className="text-[11px] text-(--color-text-muted)">Gennemsnit</span>
              <span className="text-[15px] font-semibold text-(--color-text)">{stats.avg} kg</span>
            </div>
            <div className="flex flex-col rounded-xl bg-(--color-surface-2) px-3 py-2">
              <span className="text-[11px] text-(--color-text-muted)">Højeste</span>
              <span className="text-[15px] font-semibold text-(--color-text)">{stats.max} kg</span>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent-bright)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-accent-bright)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis
                  tick={chartAxisTick}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: "var(--color-text)" }}
                />
                <ReferenceLine
                  y={stats.avg}
                  stroke="var(--color-text-muted)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-accent-bright)"
                  strokeWidth={2}
                  fill="url(#weightFill)"
                  dot={{ r: 3, fill: "var(--color-accent-bright)" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ikke logget din kropsvægt endnu.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <BodyweightEntryCard
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
