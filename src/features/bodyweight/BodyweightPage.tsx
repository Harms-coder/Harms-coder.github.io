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
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextField } from "../../components/TextField";
import { ProgressPhotos } from "./ProgressPhotos";
import { BODY_MEASUREMENTS, type BodyMeasurement } from "../../types";
import {
  createBodyweightEntry,
  deleteBodyweightEntry,
  listBodyweightEntries,
  updateBodyweightEntry,
} from "../../db/bodyweight";
import { chartAxisTick, chartLineCursor, chartTooltipStyle, chartTooltipValue } from "../../lib/chart";
import { groupByMonthAndWeek } from "../../lib/grouping";
import { IconChevronDown } from "../../components/icons";
import { useChartTouch } from "../../lib/chartTouch";
import {
  formatMonthTitle,
  formatShortDate,
  formatWeekRange,
  getWeekNumber,
  todayISODate,
} from "../../lib/date";
import {
  DEFAULT_RANGE,
  RANGE_KEYS,
  RANGE_LABELS,
  getRangeStart,
  type RangeKey,
} from "../../lib/dateRange";
import type { BodyweightEntry } from "../../types";
import { BodyweightEntryCard } from "./BodyweightEntryCard";

export function BodyweightPage() {
  const { handlers, tooltipActive } = useChartTouch();
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  function toggle(setter: typeof setCollapsedMonths, key: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }
  const [entries, setEntries] = useState<BodyweightEntry[]>([]);
  const months = useMemo(() => groupByMonthAndWeek(entries, (entry) => entry.date), [entries]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISODate());
  const [weight, setWeight] = useState("");
  /* Kropsmål er valgfrie — de gemmes som tekst her og først som tal, når der står noget. */
  const [measurements, setMeasurements] = useState<Partial<Record<BodyMeasurement, string>>>({});
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);

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
    const parsed: Partial<Record<BodyMeasurement, number>> = {};
    for (const name of BODY_MEASUREMENTS) {
      const value = Number(measurements[name]);
      if (value > 0) parsed[name] = value;
    }
    await createBodyweightEntry({ date, weight: weightValue, measurements: parsed });
    setWeight("");
    setMeasurements({});
    setShowMeasurements(false);
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

  const rangeStart = getRangeStart(range);
  const chartData = useMemo(
    () =>
      [...entries]
        .filter((entry) => entry.date >= rangeStart)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((entry) => ({
          date: entry.date,
          label: formatShortDate(entry.date),
          weight: entry.weight,
        })),
    [entries, rangeStart],
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
      <PageBackdrop image="/images/kropsvaegt-forest.jpg" imagePosition="center 50%" />
      <h1 className="text-(--color-text)">Kropsvægt</h1>

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
        {showMeasurements ? (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Kropsmål (cm) — udfyld kun dem du har målt
            </span>
            <div className="grid grid-cols-2 gap-3">
              {BODY_MEASUREMENTS.map((name) => (
                <TextField
                  key={name}
                  label={name}
                  type="number"
                  inputMode="decimal"
                  value={measurements[name] ?? ""}
                  onChange={(e) =>
                    setMeasurements((current) => ({ ...current, [name]: e.target.value }))
                  }
                />
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMeasurements(true)}
            className="self-start text-[13px] font-medium text-(--color-cat-body) active:opacity-70"
          >
            + Tilføj kropsmål
          </button>
        )}
        <Button type="submit" tone="body">Gem</Button>
      </form>

      <ProgressPhotos />

      {entries.length > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <span className="text-[13px] font-medium text-(--color-text-muted)">Udvikling</span>

          <SegmentedControl
            options={RANGE_KEYS.map((key) => ({ value: key, label: RANGE_LABELS[key] }))}
            value={range}
            onChange={setRange}
            tone="body"
          />

          {!(chartData.length > 1 && stats) ? (
            <p className="text-[13px] text-(--color-text-muted)">
              Ingen målinger i denne periode.
            </p>
          ) : (
            <>
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

          <div className="h-48" {...handlers}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-cat-body)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-cat-body)" stopOpacity={0} />
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
                  active={tooltipActive}
                  cursor={chartLineCursor}
                  contentStyle={chartTooltipStyle}
                  labelStyle={{ color: "var(--color-text)" }}
                  formatter={chartTooltipValue("kg", "Vægt")}
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
                  stroke="var(--color-cat-body)"
                  strokeWidth={2}
                  fill="url(#weightFill)"
                  dot={{ r: 3, fill: "var(--color-cat-body)" }}
                  activeDot={tooltipActive === false ? false : { r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
            </>
          )}
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ikke logget din kropsvægt endnu.
        </p>
      )}

      {/* Måned → uge → vejninger, samme opbygning som Historik: uden den bliver listen
          uendelig lang, når man har vejet sig dagligt i et år. */}
      {months.map((month) => {
        const collapsed = collapsedMonths.has(month.key);
        return (
          <div key={month.key} className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => toggle(setCollapsedMonths, month.key)}
              className="flex items-center justify-between gap-2 pt-1 text-left"
            >
              <span className="text-[17px] font-bold text-(--color-text)">
                {formatMonthTitle(month.key)}
              </span>
              <span className="flex items-center gap-2 text-[12.5px] text-(--color-text-muted)">
                {month.count} {month.count === 1 ? "vejning" : "vejninger"}
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
                />
              </span>
            </button>

            {!collapsed &&
              month.weeks.map((week) => {
                const open = expandedWeeks.has(week.key);
                const vaegte = week.items.map((e) => e.weight);
                const gennemsnit =
                  Math.round((vaegte.reduce((a, b) => a + b, 0) / vaegte.length) * 10) / 10;
                return (
                  <div key={week.key} className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggle(setExpandedWeeks, week.key)}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-left card-shadow"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-semibold text-(--color-text)">
                          Uge {getWeekNumber(week.key)}
                        </span>
                        <span className="text-[12.5px] text-(--color-text-muted)">
                          {formatWeekRange(week.key)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[13px] font-semibold text-(--color-text)">
                            {gennemsnit} kg
                          </span>
                          <span className="text-[12px] text-(--color-text-muted)">
                            {week.items.length} {week.items.length === 1 ? "vejning" : "vejninger"}
                          </span>
                        </div>
                        <IconChevronDown
                          className={`h-4 w-4 flex-shrink-0 text-(--color-text-muted) transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {open && (
                      <div className="flex flex-col gap-2.5 pl-3">
                        {week.items.map((entry) => (
                          <BodyweightEntryCard
                            key={entry.id}
                            entry={entry}
                            onUpdate={(changes) => handleUpdate(entry.id, changes)}
                            onDelete={() => handleDelete(entry.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}
