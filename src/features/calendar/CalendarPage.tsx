import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  IconChevronLeft,
  IconChevronRight,
} from "../../components/icons";
import { PageBackdrop } from "../../components/PageBackdrop";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { listGoals } from "../../db/goals";
import {
  deletePlannedWorkout,
  listPlannedWorkoutsInRange,
  movePlannedWorkout,
  setPlannedStatus,
  setPlannedWorkoutSeries,
} from "../../db/plannedWorkouts";
import { listRoutines } from "../../db/routines";
import { listSessionsInRange } from "../../db/sessions";
import { listSetsForSession } from "../../db/sets";
import {
  DA_MONTHS,
  DA_WEEKDAYS_SHORT,
  formatLongDate,
  getMonthGrid,
  parseISODate,
  toISODate,
  todayISODate,
} from "../../lib/date";
import type {
  BodyweightEntry,
  Goal,
  PlannedStatus,
  CardioEntry,
  Exercise,
  PlannedWorkout,
  Routine,
  SetEntry,
  WorkoutSession,
} from "../../types";
import { SegmentedControl } from "../../components/SegmentedControl";
import { buildMonthStats } from "../../lib/calendarStats";
import { getWeekStart } from "../../lib/date";
import { startSession } from "../../db/sessions";
import { CalendarMonthStats } from "./CalendarMonthStats";
import { DayDetails } from "./DayDetails";
import { DayPlanner } from "./DayPlanner";
import { WeekView } from "./WeekView";

/** Kalenderens egen kategorifarve (samme som fanen i bundmenuen). */
const PLAN_COLOR = "var(--color-cat-plan)";

export function CalendarPage() {
  const location = useLocation();
  const preselectRoutineId = (location.state as { routineId?: string } | null)?.routineId;
  const today = new Date();
  const [monthCursor, setMonthCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(todayISODate());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [cardioEntries, setCardioEntries] = useState<CardioEntry[]>([]);
  const [plans, setPlans] = useState<PlannedWorkout[]>([]);
  const [selectedSets, setSelectedSets] = useState<SetEntry[]>([]);
  const [bodyweight, setBodyweight] = useState<BodyweightEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<"month" | "week">("month");
  const [editingPlan, setEditingPlan] = useState(false);
  const [monthLoaded, setMonthLoaded] = useState(false);
  const navigate = useNavigate();

  const grid = useMemo(
    () => getMonthGrid(monthCursor.getFullYear(), monthCursor.getMonth()),
    [monthCursor],
  );

  useEffect(() => {
    void loadExercisesAndRoutines();
  }, []);

  useEffect(() => {
    void loadMonthData();
  }, [monthCursor]);

  useEffect(() => {
    void loadSelectedDaySets();
    setEditingPlan(false);
  }, [selectedDate, sessions]);

  async function loadExercisesAndRoutines() {
    const [allExercises, allRoutines, allWeights, allGoals] = await Promise.all([
      listExercises(),
      listRoutines(),
      listBodyweightEntries(),
      listGoals(),
    ]);
    setExercises(allExercises);
    setRoutines(allRoutines);
    setBodyweight(allWeights);
    setGoals(allGoals);
  }

  async function loadMonthData() {
    const start = toISODate(grid[0]);
    const end = toISODate(grid[grid.length - 1]);
    const [rangeSessions, rangePlans, rangeCardio] = await Promise.all([
      listSessionsInRange(start, end),
      listPlannedWorkoutsInRange(start, end),
      listCardioEntriesInRange(start, end),
    ]);
    setSessions(rangeSessions);
    setPlans(rangePlans);
    setCardioEntries(rangeCardio);
    setMonthLoaded(true);
  }

  async function loadSelectedDaySets() {
    const daySessions = sessions.filter((s) => s.date === selectedDate);
    if (daySessions.length === 0) {
      setSelectedSets([]);
      return;
    }
    const setsPerSession = await Promise.all(
      daySessions.map((session) => listSetsForSession(session.id)),
    );
    setSelectedSets(setsPerSession.flat());
  }

  async function handleSavePlan(input: {
    routineId?: string;
    exerciseIds: string[];
    occurrences: number;
  }) {
    const { occurrences, ...plan } = input;
    await setPlannedWorkoutSeries(selectedDate, occurrences, plan);
    await loadMonthData();
  }

  async function handleStatus(status: PlannedStatus) {
    if (!selectedPlan) return;
    await setPlannedStatus(selectedPlan.id, status);
    await loadMonthData();
  }

  async function handleMove(toDate: string) {
    if (!selectedPlan) return;
    await movePlannedWorkout(selectedPlan.id, toDate);
    await loadMonthData();
    setSelectedDate(toDate);
    setMonthCursor(new Date(parseISODate(toDate).getFullYear(), parseISODate(toDate).getMonth(), 1));
  }

  async function handleStart() {
    await startSession();
    navigate("/traening/live");
  }

  async function handleRemovePlan() {
    const plan = plans.find((p) => p.date === selectedDate);
    if (!plan) return;
    await deletePlannedWorkout(plan.id);
    await loadMonthData();
  }

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const routineById = useMemo(() => new Map(routines.map((r) => [r.id, r])), [routines]);
  const sessionDates = useMemo(() => new Set(sessions.map((s) => s.date)), [sessions]);
  const cardioDates = useMemo(() => new Set(cardioEntries.map((c) => c.date)), [cardioEntries]);
  const planDates = useMemo(() => new Set(plans.map((p) => p.date)), [plans]);
  const routineColorByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const plan of plans) {
      const color = plan.routineId ? routineById.get(plan.routineId)?.color : undefined;
      if (color) map.set(plan.date, color);
    }
    return map;
  }, [plans, routineById]);
  const selectedPlan = plans.find((p) => p.date === selectedDate);
  const monthKey = toISODate(monthCursor).slice(0, 7);
  const monthStats = useMemo(
    () => buildMonthStats(monthKey, sessions, cardioEntries, plans, exercises),
    [monthKey, sessions, cardioEntries, plans, exercises],
  );
  const weekStart = getWeekStart(selectedDate);
  const selectedBodyweight = bodyweight.find((b) => b.date === selectedDate);
  const sessionsGoal = goals.find((g) => g.type === "sessionsPerWeek");
  const goalRemaining = useMemo(() => {
    if (!sessionsGoal) return undefined;
    const weekEnd = new Date(parseISODate(weekStart));
    weekEnd.setDate(weekEnd.getDate() + 6);
    const done = sessions.filter(
      (s) => s.endedAt && s.date >= weekStart && s.date <= toISODate(weekEnd),
    ).length;
    return Math.max(0, sessionsGoal.target - done);
  }, [sessionsGoal, sessions, weekStart]);
  const selectedCardioEntries = cardioEntries.filter((c) => c.date === selectedDate);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/kalender-trail.jpg" imagePosition="center 30%" />
      <div className="flex flex-col gap-1">
        <h1 className="text-(--color-text)">Kalender</h1>
        <p className="text-[13px] text-(--color-text-secondary)">
          Planlæg og følg dine træninger.
        </p>
      </div>

      <CalendarMonthStats stats={monthStats} />

      <SegmentedControl
        options={[
          { value: "month", label: "Måned" },
          { value: "week", label: "Uge" },
        ]}
        value={view}
        onChange={setView}
        tone="plan"
      />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
          }
          aria-label="Forrige måned"
          className="flex h-9 w-9 items-center justify-center rounded-full glass-fill text-(--color-text) active:opacity-70"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[17px] font-semibold text-(--color-text)">
          {DA_MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() =>
            setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
          }
          aria-label="Næste måned"
          className="flex h-9 w-9 items-center justify-center rounded-full glass-fill text-(--color-text) active:opacity-70"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      {view === "month" ? (
        <>
        <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-(--color-text-muted)">
          {DA_WEEKDAYS_SHORT.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {grid.map((date) => {
            const iso = toISODate(date);
            const isCurrentMonth = date.getMonth() === monthCursor.getMonth();
            const isSelected = iso === selectedDate;
            const isToday = iso === todayISODate();
            const hasSession = sessionDates.has(iso);
            const hasCardio = cardioDates.has(iso);
            const hasPlan = planDates.has(iso);
            const hasActivity = hasSession || hasCardio || hasPlan;
            const routineColor = routineColorByDate.get(iso);

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                style={{ "--badge-color": PLAN_COLOR } as CSSProperties}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[14px] transition-transform duration-150 ${
                  isSelected
                    ? "cat-fill scale-105 font-semibold text-(--color-text)"
                    : isCurrentMonth
                      ? "text-(--color-text)"
                      : "text-(--color-text-muted)"
                } ${isToday && !isSelected ? "cat-badge border font-semibold" : ""} ${
                  hasActivity && !isSelected ? "day-glow" : ""
                }`}
              >
                <span>{date.getDate()}</span>
                {/* Chips frem for prikker: bredere flader er nemmere at skelne på en telefon. */}
                <span className="flex h-1.5 items-center gap-0.5">
                  {hasSession && (
                    <span
                      className="h-1.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--color-text)"
                          : (routineColor ?? "var(--color-cat-strength)"),
                      }}
                    />
                  )}
                  {hasCardio && (
                    <span
                      className="h-1.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? "var(--color-text)" : "var(--color-cat-cardio)",
                      }}
                    />
                  )}
                  {hasPlan && (
                    <span
                      className="h-1.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? "var(--color-text)" : (routineColor ?? PLAN_COLOR),
                      }}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        </>
      ) : (
        <WeekView
          weekStart={weekStart}
          selectedDate={selectedDate}
          plans={plans}
          sessions={sessions}
          cardio={cardioEntries}
          routineById={routineById}
          exerciseById={exerciseById}
          onSelect={setSelectedDate}
        />
      )}

      <div className="flex flex-col gap-3 pt-2">
        <span className="text-[15px] font-medium text-(--color-text)">
          {formatLongDate(parseISODate(selectedDate))}
        </span>

        <DayDetails
          date={selectedDate}
          plan={selectedPlan}
          routine={selectedPlan?.routineId ? routineById.get(selectedPlan.routineId) : undefined}
          exerciseById={exerciseById}
          sessions={sessions.filter((session) => session.date === selectedDate)}
          sets={selectedSets}
          cardio={selectedCardioEntries}
          bodyweight={selectedBodyweight}
          goalRemaining={goalRemaining}
          onStart={handleStart}
          onEdit={() => setEditingPlan(true)}
          onMove={handleMove}
          onDelete={handleRemovePlan}
          onStatus={handleStatus}
        />

        {monthLoaded && (!selectedPlan || editingPlan) && (
          <DayPlanner
            key={selectedDate}
            date={selectedDate}
            routines={routines}
            exercises={exercises}
            plan={selectedPlan}
            preselectRoutineId={preselectRoutineId}
            onSave={async (input) => {
              await handleSavePlan(input);
              setEditingPlan(false);
            }}
            onRemove={handleRemovePlan}
          />
        )}
      </div>
    </div>
  );
}
