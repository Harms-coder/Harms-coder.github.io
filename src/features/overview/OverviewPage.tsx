import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IconClock, IconDumbbell, IconMapPin, IconRun } from "../../components/icons";
import { Sparkline } from "../../components/Sparkline";
import { StatTile } from "../../components/StatTile";
import { StrengthGainList } from "../../components/StrengthGainList";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { listSessionsInRange } from "../../db/sessions";
import { listAllSets } from "../../db/sets";
import {
  DA_WEEKDAYS_SHORT,
  formatShortDate,
  parseISODate,
  toISODate,
  todayISODate,
} from "../../lib/date";
import { buildStrengthGains, groupSetsByExercise } from "../../lib/strengthGains";
import type { BodyweightEntry, CardioEntry, Exercise, SetEntry, WorkoutSession } from "../../types";

const TOP_GAINS_SHOWN = 5;

type RangeKey = "week" | "month" | "quarter" | "halfyear" | "year";

const RANGE_LABELS: Record<RangeKey, string> = {
  week: "Uge",
  month: "Måned",
  quarter: "3 mdr",
  halfyear: "6 mdr",
  year: "År",
};

const RANGE_DAYS: Record<RangeKey, number> = {
  week: 7,
  month: 30,
  quarter: 91,
  halfyear: 182,
  year: 365,
};

function getRangeStart(range: RangeKey): string {
  const start = new Date();
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return toISODate(start);
}

/** Den forudgående periode af samme længde, brugt til at vise ↑/↓ vs. sidst. */
function getPreviousRangeBounds(range: RangeKey): { start: string; end: string } {
  const end = new Date();
  end.setDate(end.getDate() - RANGE_DAYS[range]);
  const start = new Date(end);
  start.setDate(start.getDate() - (RANGE_DAYS[range] - 1));
  return { start: toISODate(start), end: toISODate(end) };
}

/** Procentvis ændring; udefineret hvis der intet var at sammenligne med i forrige periode. */
function percentChange(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

export function OverviewPage() {
  const [range, setRange] = useState<RangeKey>("week");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [cardioEntries, setCardioEntries] = useState<CardioEntry[]>([]);
  const [bodyweightEntries, setBodyweightEntries] = useState<BodyweightEntry[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allSets, setAllSets] = useState<SetEntry[]>([]);
  const [prevSessions, setPrevSessions] = useState<WorkoutSession[]>([]);
  const [prevCardioEntries, setPrevCardioEntries] = useState<CardioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const start = getRangeStart(range);
    const end = todayISODate();
    const previous = getPreviousRangeBounds(range);
    const [rangeSessions, rangeCardio, allBodyweight, prevRangeSessions, prevRangeCardio] =
      await Promise.all([
        listSessionsInRange(start, end),
        listCardioEntriesInRange(start, end),
        listBodyweightEntries(),
        listSessionsInRange(previous.start, previous.end),
        listCardioEntriesInRange(previous.start, previous.end),
      ]);
    setSessions(rangeSessions.filter((session) => session.endedAt));
    setCardioEntries(rangeCardio);
    setBodyweightEntries(allBodyweight);
    setPrevSessions(prevRangeSessions.filter((session) => session.endedAt));
    setPrevCardioEntries(prevRangeCardio);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [range]);

  useEffect(() => {
    void Promise.all([listExercises(), listAllSets()]).then(([exerciseList, setList]) => {
      setExercises(exerciseList);
      setAllSets(setList);
    });
  }, []);

  const strengthGains = useMemo(() => {
    const setsByExercise = groupSetsByExercise(allSets);
    return buildStrengthGains(exercises, setsByExercise).sort((a, b) => b.percent - a.percent);
  }, [exercises, allSets]);
  const topGains = strengthGains.slice(0, TOP_GAINS_SHOWN);
  const avgGainPercent =
    strengthGains.length > 0
      ? Math.round((strengthGains.reduce((sum, g) => sum + g.percent, 0) / strengthGains.length) * 10) / 10
      : undefined;

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const totalCardioKm = cardioEntries.reduce((sum, c) => sum + c.distanceKm, 0);
  const rangeStart = getRangeStart(range);

  const prevTotalMinutes = prevSessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const prevTotalCardioKm = prevCardioEntries.reduce((sum, c) => sum + c.distanceKm, 0);

  const { totalKgLifted, prevTotalKgLifted } = useMemo(() => {
    const kgLiftedFor = (sessionList: WorkoutSession[]) => {
      const sessionIds = new Set(sessionList.map((s) => s.id));
      return allSets
        .filter((set) => set.setType !== "warmup" && sessionIds.has(set.sessionId))
        .reduce((sum, set) => sum + set.weight * set.reps, 0);
    };
    return { totalKgLifted: kgLiftedFor(sessions), prevTotalKgLifted: kgLiftedFor(prevSessions) };
  }, [sessions, prevSessions, allSets]);

  const sessionsDelta = percentChange(sessions.length, prevSessions.length);
  const minutesDelta = percentChange(totalMinutes, prevTotalMinutes);
  const cardioCountDelta = percentChange(cardioEntries.length, prevCardioEntries.length);
  const cardioKmDelta = percentChange(totalCardioKm, prevTotalCardioKm);
  const kgLiftedDelta = percentChange(totalKgLifted, prevTotalKgLifted);

  const weightInRange = useMemo(
    () =>
      [...bodyweightEntries]
        .filter((entry) => entry.date >= rangeStart)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [bodyweightEntries, rangeStart],
  );
  const weightLabels = useMemo(
    () =>
      weightInRange.map((entry) =>
        range === "week"
          ? DA_WEEKDAYS_SHORT[(parseISODate(entry.date).getDay() + 6) % 7]
          : formatShortDate(entry.date),
      ),
    [weightInRange, range],
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
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-(--color-text)">Oversigt</h1>
        <p className="text-[13px] text-(--color-text-secondary)">Din indsats tæller. Bliv ved.</p>
      </div>

      <div className="flex gap-1 rounded-full border border-(--color-border) bg-(--color-bg-tertiary) p-1">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRange(key)}
            className={`min-h-9 flex-1 whitespace-nowrap rounded-full px-1 text-[12px] font-medium ${
              range === key
                ? "accent-fill text-(--color-text)"
                : "bg-transparent text-(--color-text-muted)"
            }`}
          >
            {RANGE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="hero-glow flex flex-col gap-1 rounded-2xl border border-(--color-border-accent) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-accent-bright)">Motivation</span>
        <p className="text-[15px] font-medium text-(--color-text)">
          Små skridt skaber store resultater.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Træninger"
          value={`${sessions.length}`}
          to="/historik"
          icon={IconDumbbell}
          delta={sessionsDelta}
        />
        <StatTile
          label="Minutter"
          value={`${totalMinutes}`}
          to="/minutter"
          icon={IconClock}
          delta={minutesDelta}
        />
        <StatTile
          label="Løbeture"
          value={`${cardioEntries.length}`}
          to="/cardio"
          icon={IconRun}
          delta={cardioCountDelta}
        />
        <StatTile
          label="Km løbet"
          value={totalCardioKm.toFixed(1)}
          to="/kilometer"
          icon={IconMapPin}
          delta={cardioKmDelta}
        />
        <StatTile
          label={`Kg løftet · ${RANGE_LABELS[range].toLowerCase()}`}
          value={`${Math.round(totalKgLifted).toLocaleString("da-DK")} kg`}
          delta={kgLiftedDelta}
          className="col-span-2"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
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
            <Sparkline
              values={weightInRange.map((entry) => entry.weight)}
              labels={weightLabels}
              unit=" kg"
            />
            {weightChange !== undefined && (
              <span
                className={`text-[13px] font-medium ${
                  weightChange >= 0 ? "text-(--color-success)" : "text-(--color-danger)"
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

      {topGains.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Styrke-fremgang
            </span>
            {avgGainPercent !== undefined && (
              <span className="text-[15px] font-semibold text-(--color-accent-glow)">
                {avgGainPercent > 0 ? "+" : ""}
                {avgGainPercent}% i gennemsnit
              </span>
            )}
          </div>

          <StrengthGainList gains={topGains} />

          <Link to="/progression" className="text-[13px] font-medium text-(--color-accent)">
            Se alle øvelser →
          </Link>
        </div>
      )}

      <Link
        to="/demo"
        className="pb-2 text-center text-[11px] text-(--color-text-muted) active:opacity-70"
      >
        Eksempeldata
      </Link>
    </div>
  );
}
