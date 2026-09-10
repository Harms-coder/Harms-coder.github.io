import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  IconChevronDown,
  IconClipboard,
  IconClock,
  IconDumbbell,
  IconList,
  IconMapPin,
  IconRun,
  IconTrendUp,
  type IconComponent,
} from "../../components/icons";
import { PageBackdrop } from "../../components/PageBackdrop";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SummaryRow } from "../../components/SummaryRow";
import { SwipeToDelete } from "../../components/SwipeToDelete";
import { deleteCardioEntry, listCardioEntries } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { deleteSession, listSessions } from "../../db/sessions";
import { deleteSet, listSetsForSession } from "../../db/sets";
import {
  DA_MONTHS,
  formatDuration,
  formatLongDate,
  formatMonthTitle,
  getWeekMonthKey,
  getWeekNumber,
  getWeekStart,
  parseISODate,
} from "../../lib/date";
import {
  DEFAULT_RANGE,
  RANGE_KEYS,
  RANGE_LABELS,
  getPreviousRangeBounds,
  getRangeStart,
  type RangeKey,
} from "../../lib/dateRange";
import { joinDanish } from "../../lib/format";
import type { CardioEntry, Exercise, SetEntry, WorkoutSession } from "../../types";

type TypeFilter = "all" | "strength" | "cardio";

const TYPE_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "strength", label: "Styrke" },
  { value: "cardio", label: "Cardio" },
];

interface StrengthItem {
  kind: "strength";
  id: string;
  date: string;
  title: string;
  durationMin?: number;
  exerciseIds: string[];
  sets: SetEntry[];
  session: WorkoutSession;
}

interface CardioItem {
  kind: "cardio";
  id: string;
  date: string;
  title: string;
  durationMin: number;
  distanceKm: number;
  entry: CardioEntry;
}

type HistoryItem = StrengthItem | CardioItem;

interface WeekGroup {
  key: string;
  items: HistoryItem[];
  totalMin: number;
}

interface MonthGroup {
  key: string;
  totalMin: number;
  count: number;
  weeks: WeekGroup[];
}

function formatWeekRange(weekStartISO: string): string {
  const start = parseISODate(weekStartISO);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const short = (d: Date) => DA_MONTHS[d.getMonth()].slice(0, 3);
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()}.–${end.getDate()}. ${short(end)}`
    : `${start.getDate()}. ${short(start)} – ${end.getDate()}. ${short(end)}`;
}

/** Kategorifarven for en historik-post — styrke og cardio kendes på farven alene. */
function itemColor(kind: HistoryItem["kind"]): string {
  return kind === "strength" ? "var(--color-cat-strength)" : "var(--color-cat-cardio)";
}

function TypeBadge({ kind }: { kind: HistoryItem["kind"] }) {
  const Icon = kind === "strength" ? IconDumbbell : IconRun;
  const color = itemColor(kind);
  return (
    <span
      className="cat-badge flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border"
      style={{ "--badge-color": color } as CSSProperties}
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </span>
  );
}

function StatLine({
  items,
  color,
}: {
  items: { icon: IconComponent; text: string }[];
  color: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          {i > 0 && <span className="h-3 w-px flex-shrink-0 bg-(--color-border)" />}
          <span className="flex items-center gap-1.5 text-[12.5px] text-(--color-text-muted)">
            <item.icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [setsBySession, setSetsBySession] = useState<Map<string, SetEntry[]>>(new Map());
  const [cardio, setCardio] = useState<CardioEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  async function load() {
    const [allSessions, allExercises, allCardio] = await Promise.all([
      listSessions(),
      listExercises(),
      listCardioEntries(),
    ]);
    const setsPerSession = await Promise.all(
      allSessions.map(async (s) => [s.id, await listSetsForSession(s.id)] as const),
    );
    setSessions(allSessions);
    setSetsBySession(new Map(setsPerSession));
    setCardio(allCardio);
    setExercises(allExercises);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const allItems = useMemo<HistoryItem[]>(() => {
    const strength: HistoryItem[] = sessions
      .map((session) => {
        const sets = setsBySession.get(session.id) ?? [];
        const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
        const categories = [
          ...new Set(
            exerciseIds
              .map((id) => exerciseById.get(id)?.category)
              .filter((c): c is string => Boolean(c)),
          ),
        ];
        return {
          kind: "strength" as const,
          id: session.id,
          date: session.date,
          title: categories.length > 0 ? joinDanish(categories) : "Styrketræning",
          durationMin: session.durationMin,
          exerciseIds,
          sets,
          session,
        };
      })
      .filter((item) => item.sets.length > 0);

    const cardioItems: HistoryItem[] = cardio.map((entry) => ({
      kind: "cardio" as const,
      id: entry.id,
      date: entry.date,
      title: entry.activity,
      durationMin: entry.durationMin,
      distanceKm: entry.distanceKm,
      entry,
    }));

    return [...strength, ...cardioItems].sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, setsBySession, cardio, exerciseById]);

  const rangeStart = getRangeStart(range);
  const filteredItems = useMemo(
    () =>
      allItems.filter(
        (item) =>
          item.date >= rangeStart && (typeFilter === "all" || item.kind === typeFilter),
      ),
    [allItems, rangeStart, typeFilter],
  );

  const months = useMemo<MonthGroup[]>(() => {
    // Grupperes uge først, så en uge der går på tværs af to måneder ikke optræder to gange.
    const byWeek = new Map<string, HistoryItem[]>();
    for (const item of filteredItems) {
      const weekKey = getWeekStart(item.date);
      byWeek.set(weekKey, [...(byWeek.get(weekKey) ?? []), item]);
    }

    const byMonth = new Map<string, WeekGroup[]>();
    for (const [weekKey, items] of byWeek) {
      const week: WeekGroup = {
        key: weekKey,
        items,
        totalMin: items.reduce((sum, i) => sum + (i.durationMin ?? 0), 0),
      };
      // Ugen hører til den måned, dens torsdag ligger i (samme regel som ISO-ugenumre).
      const monthKey = getWeekMonthKey(weekKey);
      byMonth.set(monthKey, [...(byMonth.get(monthKey) ?? []), week]);
    }

    return [...byMonth.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, weeks]) => {
        const sortedWeeks = [...weeks].sort((a, b) => b.key.localeCompare(a.key));
        return {
          key,
          count: sortedWeeks.reduce((sum, w) => sum + w.items.length, 0),
          totalMin: sortedWeeks.reduce((sum, w) => sum + w.totalMin, 0),
          weeks: sortedWeeks,
        };
      });
  }, [filteredItems]);

  const summary = useMemo(() => {
    const totalMin = filteredItems.reduce((sum, i) => sum + (i.durationMin ?? 0), 0);
    const totalSets = filteredItems.reduce(
      (sum, i) => sum + (i.kind === "strength" ? i.sets.length : 0),
      0,
    );
    const totalKm =
      Math.round(
        filteredItems.reduce((sum, i) => sum + (i.kind === "cardio" ? i.distanceKm : 0), 0) * 10,
      ) / 10;
    let deltaPercent: number | undefined;
    if (range !== "always") {
      const { start, end } = getPreviousRangeBounds(range);
      const previousCount = allItems.filter(
        (item) =>
          item.date >= start &&
          item.date <= end &&
          (typeFilter === "all" || item.kind === typeFilter),
      ).length;
      if (previousCount > 0) {
        deltaPercent = Math.round(((filteredItems.length - previousCount) / previousCount) * 100);
      }
    }
    return { count: filteredItems.length, totalMin, totalSets, totalKm, deltaPercent };
  }, [filteredItems, allItems, range, typeFilter]);

  function toggleMonth(key: string) {
    setCollapsedMonths((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleWeek(key: string) {
    setExpandedWeeks((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleDelete(item: HistoryItem) {
    if (item.kind === "strength") {
      await Promise.all(item.sets.map((set) => deleteSet(set.id)));
      await deleteSession(item.id);
      setSessions((current) => current.filter((s) => s.id !== item.id));
    } else {
      await deleteCardioEntry(item.id);
      setCardio((current) => current.filter((c) => c.id !== item.id));
    }
  }

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/historik-footprints.jpg" imagePosition="center 65%" />
      <div className="flex flex-col gap-1">
        <h1 className="text-(--color-text)">Historik</h1>
        <p className="text-[13px] text-(--color-text-secondary)">
          Dine træninger samlet ét sted.
        </p>
      </div>

      <SegmentedControl
        options={TYPE_OPTIONS}
        value={typeFilter}
        onChange={setTypeFilter}
        layout="scroll"
        tone="history"
      />
      <SegmentedControl
        options={RANGE_KEYS.map((key) => ({ value: key, label: RANGE_LABELS[key] }))}
        value={range}
        onChange={setRange}
        layout="scroll"
        tone="history"
      />

      <SummaryRow
        cells={[
          {
            icon: IconDumbbell,
            value: String(summary.count),
            label: "Træninger",
            color: "var(--color-cat-strength)",
          },
          {
            icon: IconClock,
            value: formatDuration(summary.totalMin),
            label: "Total tid",
            color: "var(--color-cat-history)",
          },
          typeFilter === "cardio"
            ? {
                icon: IconMapPin,
                value: String(summary.totalKm),
                label: "Km",
                color: "var(--color-cat-cardio)",
              }
            : {
                icon: IconClipboard,
                value: String(summary.totalSets),
                label: "Sæt",
                color: "var(--color-cat-record)",
              },
          ...(summary.deltaPercent !== undefined
            ? [
                {
                  icon: IconTrendUp,
                  value: `${summary.deltaPercent > 0 ? "+" : ""}${summary.deltaPercent}%`,
                  label: "vs. forrige",
                  color: "var(--color-cat-progress)",
                },
              ]
            : []),
        ]}
      />

      {months.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Ingen træninger i den valgte periode.
        </p>
      )}

      {months.map((month) => {
        const collapsed = collapsedMonths.has(month.key);
        return (
          <div key={month.key} className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => toggleMonth(month.key)}
              className="flex items-center justify-between gap-2 pt-1 text-left"
            >
              <span className="text-[17px] font-bold text-(--color-text)">
                {formatMonthTitle(month.key)}
              </span>
              <span className="flex items-center gap-2 text-[12.5px] text-(--color-text-muted)">
                {month.count} træninger · {formatDuration(month.totalMin)}
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
                />
              </span>
            </button>

            {!collapsed &&
              month.weeks.map((week) => {
                const open = expandedWeeks.has(week.key);
                return (
                  <div key={week.key} className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => toggleWeek(week.key)}
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
                            {week.items.length} træning{week.items.length === 1 ? "" : "er"}
                          </span>
                          <span className="text-[12px] text-(--color-text-muted)">
                            {formatDuration(week.totalMin)}
                          </span>
                        </div>
                        <IconChevronDown
                          className={`h-4 w-4 flex-shrink-0 text-(--color-text-muted) transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {open && (
                      <div className="flex flex-col gap-2.5 pl-3">
                        {week.items.map((item) => {
                          const itemExpanded = expandedItemId === item.id;
                          const stats =
                            item.kind === "strength"
                              ? [
                                  ...(item.durationMin !== undefined
                                    ? [{ icon: IconClock, text: `${item.durationMin} min` }]
                                    : []),
                                  { icon: IconList, text: `${item.exerciseIds.length} øvelser` },
                                  { icon: IconClipboard, text: `${item.sets.length} sæt` },
                                ]
                              : [
                                  { icon: IconClock, text: `${item.durationMin} min` },
                                  { icon: IconMapPin, text: `${item.distanceKm} km` },
                                ];
                          return (
                            <SwipeToDelete
                              key={item.id}
                              onDelete={() => handleDelete(item)}
                              className="rounded-2xl"
                            >
                              <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.kind === "strength"
                                      ? setExpandedItemId(itemExpanded ? null : item.id)
                                      : undefined
                                  }
                                  className="flex items-center gap-3 text-left"
                                >
                                  <TypeBadge kind={item.kind} />
                                  <div className="flex flex-1 flex-col gap-1">
                                    <span className="text-[12px] text-(--color-text-muted)">
                                      {formatLongDate(parseISODate(item.date))}
                                    </span>
                                    <span className="text-[15px] font-semibold text-(--color-text)">
                                      {item.title}
                                    </span>
                                    <StatLine items={stats} color={itemColor(item.kind)} />
                                  </div>
                                  {item.kind === "strength" && (
                                    <IconChevronDown
                                      className={`h-4 w-4 flex-shrink-0 text-(--color-text-muted) transition-transform ${itemExpanded ? "rotate-180" : ""}`}
                                    />
                                  )}
                                </button>

                                {itemExpanded && item.kind === "strength" && (
                                  <div className="flex flex-col gap-2 border-t border-(--color-border) pt-3">
                                    {item.session.notes && (
                                      <p className="rounded-xl bg-(--color-surface-2) px-3 py-2 text-[13px] leading-snug text-(--color-text-secondary)">
                                        {item.session.notes}
                                      </p>
                                    )}
                                    {item.exerciseIds.map((exerciseId) => {
                                      const exerciseSets = item.sets.filter(
                                        (s) => s.exerciseId === exerciseId,
                                      );
                                      return (
                                        <div key={exerciseId} className="flex flex-col gap-0.5">
                                          <span className="text-[14px] font-medium text-(--color-text)">
                                            {exerciseById.get(exerciseId)?.name ?? "Ukendt øvelse"}
                                          </span>
                                          <span className="text-[13px] text-(--color-text-muted)">
                                            {exerciseSets.map((s, i) => (
                                              <span key={s.id}>
                                                {i > 0 && (
                                                  <span className="text-(--color-cat-strength)">
                                                    {" "}
                                                    –{" "}
                                                  </span>
                                                )}
                                                {s.weight} kg × {s.reps}
                                              </span>
                                            ))}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </SwipeToDelete>
                          );
                        })}
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
