import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "../../components/Button";
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

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">Kropsvægt</h1>

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
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

      {chartData.length > 1 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
          <span className="text-[13px] font-medium text-(--color-text-muted)">Udvikling</span>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-accent)" }}
                />
              </LineChart>
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
