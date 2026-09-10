import { useEffect, useMemo, useState } from "react";
import { PageBackdrop } from "../../components/PageBackdrop";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import {
  deletePlannedWorkout,
  listPlannedWorkoutsInRange,
  setPlannedWorkout,
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
import { formatPace } from "../../lib/format";
import type {
  CardioEntry,
  Exercise,
  PlannedWorkout,
  Routine,
  SetEntry,
  WorkoutSession,
} from "../../types";
import { DayPlanner } from "./DayPlanner";

export function CalendarPage() {
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
  const [monthLoaded, setMonthLoaded] = useState(false);

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
  }, [selectedDate, sessions]);

  async function loadExercisesAndRoutines() {
    const [allExercises, allRoutines] = await Promise.all([listExercises(), listRoutines()]);
    setExercises(allExercises);
    setRoutines(allRoutines);
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

  async function handleSavePlan(input: { routineId?: string; exerciseIds: string[] }) {
    await setPlannedWorkout(selectedDate, input);
    await loadMonthData();
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
  const selectedCardioEntries = cardioEntries.filter((c) => c.date === selectedDate);

  const setsByExercise = useMemo(() => {
    const map = new Map<string, SetEntry[]>();
    for (const set of selectedSets) {
      const list = map.get(set.exerciseId) ?? [];
      list.push(set);
      map.set(set.exerciseId, list);
    }
    return map;
  }, [selectedSets]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/kalender-trail.jpg" imagePosition="center 30%" />
      <h1 className="text-2xl font-bold text-(--color-text)">Kalender</h1>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
          }
          aria-label="Forrige måned"
          className="flex h-9 w-9 items-center justify-center rounded-full glass-fill text-(--color-text) active:opacity-70"
        >
          ‹
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
          ›
        </button>
      </div>

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
          const routineColor = routineColorByDate.get(iso);

          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelectedDate(iso)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[14px] ${
                isSelected
                  ? "accent-fill text-(--color-text)"
                  : isCurrentMonth
                    ? "text-(--color-text)"
                    : "text-(--color-text-muted)"
              } ${isToday && !isSelected ? "border border-(--color-accent)" : ""}`}
            >
              <span>{date.getDate()}</span>
              <span className="flex h-1.5 gap-0.5">
                {hasSession && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: routineColor ?? "var(--color-text-muted)" }}
                  />
                )}
                {hasCardio && (
                  <span className="h-1.5 w-1.5 rounded-full bg-(--color-text-muted)" />
                )}
                {hasPlan && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-text)"
                        : (routineColor ?? "var(--color-text-muted)"),
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <span className="text-[15px] font-medium text-(--color-text)">
          {formatLongDate(parseISODate(selectedDate))}
        </span>

        {setsByExercise.size > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
            <span className="text-[13px] font-medium text-(--color-text-muted)">
              Gennemført træning
            </span>
            {[...setsByExercise.entries()].map(([exerciseId, exSets]) => (
              <div key={exerciseId} className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-(--color-text)">
                  {exerciseById.get(exerciseId)?.name ?? "Ukendt øvelse"}
                </span>
                <span className="text-[13px] text-(--color-text-muted)">
                  {exSets.map((set, i) => (
                    <span key={set.id}>
                      {i > 0 && <span className="text-(--color-accent-bright)"> – </span>}
                      {set.weight} kg × {set.reps}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}

        {selectedCardioEntries.length > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
            <span className="text-[13px] font-medium text-(--color-text-muted)">Cardio</span>
            {selectedCardioEntries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-(--color-text)">
                  {entry.activity}
                </span>
                <span className="text-[13px] text-(--color-text-muted)">
                  {entry.distanceKm} km · {entry.durationMin} min ·{" "}
                  {formatPace(entry.distanceKm, entry.durationMin)}
                </span>
              </div>
            ))}
          </div>
        )}

        {monthLoaded && (
          <DayPlanner
            key={selectedDate}
            routines={routines}
            exercises={exercises}
            plan={selectedPlan}
            onSave={handleSavePlan}
            onRemove={handleRemovePlan}
          />
        )}
      </div>
    </div>
  );
}
