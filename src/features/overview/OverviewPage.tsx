import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { HeroHeader } from "../../components/HeroHeader";
import { RollingText } from "../../components/RollingText";
import {
  IconChevronRight,
  IconClock,
  IconDumbbell,
  IconMapPin,
  IconRun,
} from "../../components/icons";
import { ProgressBadge } from "../../components/ProgressBadge";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Sparkline } from "../../components/Sparkline";
import { StatTile } from "../../components/StatTile";
import { StrengthGainList } from "../../components/StrengthGainList";
import { ComparisonIllustration } from "./ComparisonIllustration";
import { COMPARISON_PHOTOS } from "./comparisonPhotos";
import { WeeklyGoalsCard } from "./WeeklyGoalsCard";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { listGoals } from "../../db/goals";
import { listSessions, listSessionsInRange } from "../../db/sessions";
import { listAllSets } from "../../db/sets";
import {
  DA_WEEKDAYS_SHORT,
  formatShortDate,
  getCurrentWeekRange,
  parseISODate,
  todayISODate,
} from "../../lib/date";
import { RANGE_KEYS, RANGE_LABELS, getPreviousRangeBounds, getRangeStart, type RangeKey } from "../../lib/dateRange";
import { computeGoalProgress } from "../../lib/goalProgress";
import { dayNumber } from "../../lib/quotes";
import { computeBadges } from "../../lib/progressBadges";
import { buildStrengthGains, groupSetsByExercise } from "../../lib/strengthGains";
import { listWeightComparisons, type ComparisonKind } from "../../lib/weightComparisons";
import type {
  BodyweightEntry,
  CardioEntry,
  Exercise,
  Goal,
  SetEntry,
  WorkoutSession,
} from "../../types";
import { TodayCard } from "./TodayCard";
import { useRotation } from "../motivation/useRotation";

const TOP_GAINS_SHOWN = 5;

/** Procentvis ændring; udefineret hvis der intet var at sammenligne med i forrige periode. */
function percentChange(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined;
  return Math.round(((current - previous) / previous) * 100);
}

const PHOTOGRAPHED_KINDS = new Set(Object.keys(COMPARISON_PHOTOS) as ComparisonKind[]);

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weekSessions, setWeekSessions] = useState<WorkoutSession[]>([]);
  const [weekCardio, setWeekCardio] = useState<CardioEntry[]>([]);
  // Motivation-boksen starter på dagens citat og bladrer selv videre i rotationen, mens siden er åben.
  const { rotation } = useRotation();
  const [quoteSteps, setQuoteSteps] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setQuoteSteps((n) => n + 1), 9000);
    return () => clearInterval(id);
  }, []);
  const quoteText = rotation.length > 0 ? rotation[(dayNumber() + quoteSteps) % rotation.length].text : "";
  const [allSessions, setAllSessions] = useState<WorkoutSession[]>([]);

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
    void Promise.all([listExercises(), listAllSets(), listGoals(), listSessions()]).then(
      ([exerciseList, setList, goalList, sessionList]) => {
        setExercises(exerciseList);
        setAllSets(setList);
        setGoals(goalList);
        setAllSessions(sessionList);
      },
    );
    const { start, end } = getCurrentWeekRange();
    void Promise.all([listSessionsInRange(start, end), listCardioEntriesInRange(start, end)]).then(
      ([weekSessionList, weekCardioList]) => {
        setWeekSessions(weekSessionList.filter((s) => s.endedAt));
        setWeekCardio(weekCardioList);
      },
    );
  }, []);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const setsByExercise = useMemo(() => groupSetsByExercise(allSets), [allSets]);

  const goalProgressList = useMemo(
    () =>
      goals.map((goal) =>
        computeGoalProgress(goal, {
          sessionsThisWeek: weekSessions,
          cardioThisWeek: weekCardio,
          latestBodyweight: bodyweightEntries[0],
          exerciseById,
        }),
      ),
    [goals, weekSessions, weekCardio, bodyweightEntries, exerciseById],
  );
  const weeklyGoalProgress = goalProgressList.filter(
    (g) => g.goal.type === "sessionsPerWeek" || g.goal.type === "distanceKmPerWeek",
  );

  const badges = useMemo(
    () =>
      computeBadges({
        exercises,
        setsByExercise,
        sessions: allSessions,
        goalProgress: goalProgressList,
      }),
    [exercises, setsByExercise, allSessions, goalProgressList],
  );

  const rangeStart = getRangeStart(range);

  const strengthGains = useMemo(() => {
    return buildStrengthGains(exercises, setsByExercise, rangeStart).sort((a, b) => b.percent - a.percent);
  }, [exercises, setsByExercise, rangeStart]);
  const topGains = strengthGains.slice(0, TOP_GAINS_SHOWN);
  const avgGainPercent =
    strengthGains.length > 0
      ? Math.round((strengthGains.reduce((sum, g) => sum + g.percent, 0) / strengthGains.length) * 10) / 10
      : undefined;

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
  const totalCardioKm = cardioEntries.reduce((sum, c) => sum + c.distanceKm, 0);

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
  // Vægt-sammenligningen bladrer gennem alle passende sammenligninger, mens siden er åben.
  const weightComparisons = useMemo(
    () => listWeightComparisons(totalKgLifted, PHOTOGRAPHED_KINDS),
    [totalKgLifted],
  );
  const [comparisonStep, setComparisonStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setComparisonStep((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, []);
  const weightComparison =
    weightComparisons.length > 0 ? weightComparisons[comparisonStep % weightComparisons.length] : undefined;

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
      <HeroHeader
        title="Oversigt"
        subtitle="Disciplin i dag — et stærkere dig i morgen."
        image="/images/dashboard-peaks.jpg"
        imagePosition="center 40%"
        bottomPadding="pb-3"
        sideNote={["Bedre vaner", "Stærkere dig"]}
      />

      <div className="-mt-4">
        <TodayCard />
      </div>

      {badges.length > 0 && (
        <div className="no-scrollbar glow-scroller glow-scroller-x flex gap-2 overflow-x-auto">
          {badges.map((badge) => (
            <ProgressBadge key={`${badge.kind}-${badge.label}`} badge={badge} />
          ))}
        </div>
      )}

      {weeklyGoalProgress.length > 0 ? (
        <WeeklyGoalsCard goals={weeklyGoalProgress} />
      ) : (
        <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <div className="flex items-center justify-between">
            <span className="section-title">Ugens mål</span>
            <Link
              to="/mal"
              className="flex items-center gap-1 text-[12.5px] font-medium text-(--color-cat-record)"
            >
              Alle mål
              <IconChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-[13px] text-(--color-text-muted)">
            Sæt et ugentligt mål for træning eller løb for at følge status her.
          </p>
        </div>
      )}

      <SegmentedControl
        options={RANGE_KEYS.map((key) => ({ value: key, label: RANGE_LABELS[key] }))}
        value={range}
        onChange={setRange}
      />

      <Link
        to="/motivation"
        className="relative flex min-h-36 flex-col justify-end gap-1 overflow-hidden rounded-2xl border border-(--color-border-accent) p-4 card-shadow active:opacity-80"
      >
        <img
          src="/images/dashboard-mountains.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: "center 70%" }}
        />
        <div className="hero-scrim absolute inset-0" />
        <span className="relative flex items-center gap-1 text-[13px] font-medium text-(--color-accent-bright)">
          Motivation
          <IconChevronRight className="h-3.5 w-3.5" />
        </span>
        <div className="relative flex items-end justify-between gap-3">
          <RollingText
            text={quoteText}
            className="min-w-0 flex-1 text-[20px] font-semibold leading-snug text-(--color-text)"
          />
          <div className="flex flex-shrink-0 flex-col items-end gap-1 pb-1">
            <span className="eyebrow text-(--color-text-secondary)">
              Fremgang
            </span>
            <span className="eyebrow text-(--color-text-secondary)">
              hver dag
            </span>
            <span className="mt-0.5 h-px w-7 bg-(--color-accent)" />
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Træninger"
          value={`${sessions.length}`}
          to="/historik"
          icon={IconDumbbell}
          accent="var(--color-cat-strength)"
          delta={sessionsDelta}
        />
        <StatTile
          label="Minutter"
          value={`${totalMinutes}`}
          to="/minutter"
          icon={IconClock}
          accent="var(--color-cat-goal)"
          delta={minutesDelta}
        />
        <StatTile
          label="Løbeture"
          value={`${cardioEntries.length}`}
          to="/cardio"
          icon={IconRun}
          accent="var(--color-cat-cardio)"
          delta={cardioCountDelta}
        />
        <StatTile
          label="Km løbet"
          value={totalCardioKm.toFixed(1)}
          to="/kilometer"
          icon={IconMapPin}
          accent="var(--color-cat-cardio)"
          delta={cardioKmDelta}
        />
        <StatTile
          label={`Kg løftet · ${RANGE_LABELS[range].toLowerCase()}`}
          value={`${Math.round(totalKgLifted).toLocaleString("da-DK")} kg`}
          delta={kgLiftedDelta}
          note={weightComparison && <RollingText text={weightComparison.text} />}
          noteIllustration={
            weightComparison && (
              <ComparisonIllustration key={weightComparison.text} kinds={weightComparison.kinds} />
            )
          }
          icon={IconDumbbell}
          className="col-span-2"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center justify-between">
          <span className="section-title">Kropsvægt</span>
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

      {allSets.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <div className="flex items-center justify-between">
            <span className="section-title">
              Styrke-fremgang · {RANGE_LABELS[range].toLowerCase()}
            </span>
            {avgGainPercent !== undefined && (
              <span className="text-[15px] font-semibold text-(--color-accent-glow)">
                {avgGainPercent > 0 ? "+" : ""}
                {avgGainPercent}% i gennemsnit
              </span>
            )}
          </div>

          {topGains.length > 0 ? (
            <StrengthGainList gains={topGains} />
          ) : (
            <p className="text-[13px] text-(--color-text-muted)">
              Ingen styrke-fremgang registreret i denne periode endnu.
            </p>
          )}

          <Link
            to="/progression"
            className="flex items-center gap-1 text-[13px] font-medium text-(--color-cat-progress)"
          >
            Se alle øvelser
            <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 pb-2">
        <Link
          to="/backup"
          className="flex items-center gap-1 text-[13px] font-medium text-(--color-cat-progress) active:opacity-70"
        >
          Gem en backup af dine data
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
        <Link to="/demo" className="text-[11px] text-(--color-text-muted) active:opacity-70">
          Eksempeldata
        </Link>
      </div>
    </div>
  );
}
