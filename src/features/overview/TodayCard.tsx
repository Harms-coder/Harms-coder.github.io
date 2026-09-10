import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { IconChevronRight, IconClock } from "../../components/icons";
import { listExercises } from "../../db/exercises";
import { getPlannedWorkoutForDate, listPlannedWorkoutsInRange } from "../../db/plannedWorkouts";
import { getActiveSession, listSessionsInRange, startSession } from "../../db/sessions";
import { formatMediumDate, parseISODate, toISODate, todayISODate } from "../../lib/date";
import type { PlannedWorkout, WorkoutSession } from "../../types";

const MIN_PER_EXERCISE = 8;
const UPCOMING_PLAN_WINDOW_DAYS = 13;

type TodayState =
  | { kind: "loading" }
  | { kind: "activeSession"; session: WorkoutSession }
  | { kind: "completedToday" }
  | { kind: "plan"; exerciseNames: string[] }
  | { kind: "noPlan"; nextPlanDate?: string };

export function TodayCard() {
  const navigate = useNavigate();
  const [state, setState] = useState<TodayState>({ kind: "loading" });

  async function load() {
    const today = todayISODate();
    const [active, plan, exercises, todaySessions] = await Promise.all([
      getActiveSession(),
      getPlannedWorkoutForDate(today),
      listExercises(),
      listSessionsInRange(today, today),
    ]);

    if (active) {
      setState({ kind: "activeSession", session: active });
      return;
    }
    if (todaySessions.some((s) => s.endedAt)) {
      setState({ kind: "completedToday" });
      return;
    }
    if (plan) {
      const exerciseById = new Map(exercises.map((e) => [e.id, e]));
      const names = plan.exerciseIds
        .map((id) => exerciseById.get(id)?.name)
        .filter((name): name is string => Boolean(name));
      setState({ kind: "plan", exerciseNames: names });
      return;
    }

    const windowEnd = new Date();
    windowEnd.setDate(windowEnd.getDate() + UPCOMING_PLAN_WINDOW_DAYS);
    const upcoming = await listPlannedWorkoutsInRange(today, toISODate(windowEnd));
    const next = upcoming
      .filter((p: PlannedWorkout) => p.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    setState({ kind: "noPlan", nextPlanDate: next?.date });
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleStart() {
    await startSession();
    navigate("/traening/live");
  }

  if (state.kind === "loading") {
    return (
      <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <span className="text-[13px] text-(--color-text-muted)">Indlæser…</span>
      </div>
    );
  }

  if (state.kind === "activeSession") {
    return (
      <div className="hero-glow flex flex-col gap-3 rounded-2xl border border-(--color-border-accent) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-accent-bright)">Træning i gang</span>
        <span className="text-[15px] font-medium text-(--color-text)">
          Startet{" "}
          {new Date(state.session.startedAt).toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <Button onClick={() => navigate("/traening/live")}>Fortsæt træning</Button>
      </div>
    );
  }

  if (state.kind === "completedToday") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-success)">Fuldført i dag</span>
        <span className="text-[15px] font-medium text-(--color-text)">Godt klaret! Du har trænet i dag.</span>
        <Button
          variant="ghost"
          onClick={handleStart}
          className="flex items-center gap-1 self-start px-0"
        >
          Start en ekstra træning
          <IconChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  if (state.kind === "plan") {
    const estimatedMin = state.exerciseNames.length * MIN_PER_EXERCISE;
    const preview = state.exerciseNames.slice(0, 4).join(", ");
    const extra = state.exerciseNames.length - 4;
    return (
      <div className="hero-glow flex flex-col gap-3 rounded-2xl border border-(--color-border-accent) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-accent-bright)">Dagens træning</span>
        <span className="text-[15px] font-medium text-(--color-text)">
          {preview}
          {extra > 0 ? ` +${extra} mere` : ""}
        </span>
        <span className="flex items-center gap-1.5 text-[13px] text-(--color-text-muted)">
          <IconClock className="h-4 w-4" />
          Ca. {estimatedMin} min
        </span>
        <Button onClick={handleStart} tone="strength">Start træning</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span className="text-[13px] font-medium text-(--color-text-muted)">
        {state.nextPlanDate ? "Næste pas" : "Ingen plan for i dag"}
      </span>
      <span className="text-[15px] font-medium text-(--color-text)">
        {state.nextPlanDate
          ? formatMediumDate(parseISODate(state.nextPlanDate))
          : "Start en fri træning, eller læg en plan under Programmer/Kalender."}
      </span>
      <Button onClick={handleStart}>Start træning</Button>
    </div>
  );
}
