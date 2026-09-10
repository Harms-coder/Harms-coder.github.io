import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SegmentedControl } from "../../components/SegmentedControl";
import { listCardioEntries } from "../../db/cardio";
import { monthKey, sumByKey, weekKey } from "../../lib/aggregate";
import { chartAxisTick, chartTooltipStyle } from "../../lib/chart";
import { useChartTouch } from "../../lib/chartTouch";
import { formatMonthLabel, formatShortDate } from "../../lib/date";
import type { CardioEntry } from "../../types";

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "week", label: "Pr. uge" },
  { value: "month", label: "Pr. måned" },
];

const BUCKETS_SHOWN = 12;

type Granularity = "week" | "month";

export function DistancePage() {
  const { handlers, tooltipActive } = useChartTouch();
  const [entries, setEntries] = useState<CardioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>("month");

  useEffect(() => {
    void listCardioEntries().then((all) => {
      setEntries(all);
      setLoading(false);
    });
  }, []);

  const chartData = useMemo(() => {
    const keyFn = granularity === "week" ? (e: CardioEntry) => weekKey(e.date) : (e: CardioEntry) => monthKey(e.date);
    const labelFn = granularity === "week" ? formatShortDate : formatMonthLabel;
    return sumByKey(entries, keyFn, (e) => e.distanceKm)
      .slice(-BUCKETS_SHOWN)
      .map(({ key, total }) => ({ label: labelFn(key), km: Math.round(total * 10) / 10 }));
  }, [entries, granularity]);

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-(--color-text)">Kilometer løbet</h1>

      <SegmentedControl
        options={GRANULARITY_OPTIONS}
        value={granularity}
        onChange={setGranularity}
        tone="cardio"
      />

      {chartData.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">Ingen cardio-log endnu.</p>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <span className="text-[13px] font-medium text-(--color-text-muted)">
            Km {granularity === "week" ? "pr. uge" : "pr. måned"}
          </span>
          <div className="h-56" {...handlers}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  active={tooltipActive}
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: "var(--color-text)" }}
                />
                <Bar dataKey="km" fill="var(--color-cat-cardio)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
