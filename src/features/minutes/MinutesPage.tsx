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
import { listSessions } from "../../db/sessions";
import { sumByKey, weekKey } from "../../lib/aggregate";
import { chartAxisTick, chartTooltipStyle } from "../../lib/chart";
import { formatShortDate } from "../../lib/date";
import type { WorkoutSession } from "../../types";

const WEEKS_SHOWN = 12;

export function MinutesPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listSessions().then((all) => {
      setSessions(all.filter((s) => s.endedAt));
      setLoading(false);
    });
  }, []);

  const chartData = useMemo(
    () =>
      sumByKey(
        sessions,
        (s) => weekKey(s.date),
        (s) => s.durationMin ?? 0,
      )
        .slice(-WEEKS_SHOWN)
        .map(({ key, total }) => ({ label: formatShortDate(key), minutes: total })),
    [sessions],
  );

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-(--color-text)">Træningsminutter</h1>

      {chartData.length === 0 ? (
        <p className="text-sm text-(--color-text-muted)">
          Ingen gennemførte træninger endnu.
        </p>
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <span className="text-[13px] font-medium text-(--color-text-muted)">
            Minutter pr. uge
          </span>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={chartAxisTick} axisLine={false} tickLine={false} />
                <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: "var(--color-text)" }} />
                <Bar dataKey="minutes" fill="var(--color-accent-bright)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
