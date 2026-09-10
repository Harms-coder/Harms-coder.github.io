import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { PageBackdrop } from "../../components/PageBackdrop";
import { RoutineColorPicker } from "../../components/RoutineColorPicker";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextField } from "../../components/TextField";
import {
  IconCalendar,
  IconCalendarOff,
  IconClock,
  IconDumbbell,
  IconList,
  IconStar,
} from "../../components/icons";
import { listExercises } from "../../db/exercises";
import { listPlannedWorkoutsInRange } from "../../db/plannedWorkouts";
import {
  createRoutine,
  deleteRoutine,
  listRoutines,
  ROUTINE_COLORS,
  updateRoutine,
} from "../../db/routines";
import {
  DA_WEEKDAYS,
  formatMediumDate,
  getCurrentWeekRange,
  parseISODate,
  toISODate,
  todayISODate,
} from "../../lib/date";
import type { Exercise, PlannedWorkout, Routine } from "../../types";
import { RoutineCard, type RoutineStatus } from "./RoutineCard";

type PlanFilter = "all" | "favorites" | "planned";

const FILTER_OPTIONS: { value: PlanFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "favorites", label: "Favoritter" },
  { value: "planned", label: "Planlagt" },
];

/** Hvornår et program sidst blev lagt i kalenderen, eller hvornår det er planlagt næste gang. */
function buildStatus(plansForRoutine: PlannedWorkout[], today: string): RoutineStatus {
  const sorted = [...plansForRoutine].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.find((p) => p.date >= today);
  if (upcoming) {
    const daysAway = Math.round(
      (parseISODate(upcoming.date).getTime() - parseISODate(today).getTime()) / 86_400_000,
    );
    const label =
      daysAway === 0
        ? "i dag"
        : daysAway === 1
          ? "i morgen"
          : daysAway < 7
            ? DA_WEEKDAYS[parseISODate(upcoming.date).getDay()]
            : formatMediumDate(parseISODate(upcoming.date));
    return { text: `Planlagt ${label}`, icon: IconCalendar, tone: "planned" };
  }

  const previous = [...sorted].reverse().find((p) => p.date < today);
  if (previous) {
    const daysAgo = Math.round(
      (parseISODate(today).getTime() - parseISODate(previous.date).getTime()) / 86_400_000,
    );
    const label =
      daysAgo === 1 ? "i går" : daysAgo < 7 ? `for ${daysAgo} dage siden` : formatMediumDate(parseISODate(previous.date));
    return { text: `Sidst brugt ${label}`, icon: IconClock, tone: "muted" };
  }

  return { text: "Ikke planlagt", icon: IconCalendarOff, tone: "muted" };
}

function SummaryCell({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof IconDumbbell;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-1">
      <Icon className="h-4 w-4 text-(--color-accent-bright)" />
      <span className="text-[15px] font-bold leading-tight text-(--color-text)">{value}</span>
      <span className="text-center text-[10.5px] leading-tight text-(--color-text-muted)">
        {label}
      </span>
    </div>
  );
}

export function PlanPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [plans, setPlans] = useState<PlannedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PlanFilter>("all");

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExerciseIds, setNewExerciseIds] = useState<string[]>([]);
  const [newColor, setNewColor] = useState<string>(ROUTINE_COLORS[0]);

  async function refresh() {
    // Bred nok periode til at dække al planlægning, både bagud og frem.
    const [allRoutines, allExercises, allPlans] = await Promise.all([
      listRoutines(),
      listExercises(),
      listPlannedWorkoutsInRange("1900-01-01", "2100-01-01"),
    ]);
    setRoutines(allRoutines);
    setExercises(allExercises);
    setPlans(allPlans);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  function toggleNewExercise(exerciseId: string) {
    setNewExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }

  async function handleAdd() {
    if (!newName.trim() || newExerciseIds.length === 0) return;
    await createRoutine({ name: newName, exerciseIds: newExerciseIds, color: newColor });
    setNewName("");
    setNewExerciseIds([]);
    setNewColor(ROUTINE_COLORS[0]);
    setIsAdding(false);
    await refresh();
  }

  async function handleUpdate(
    id: string,
    changes: { name: string; exerciseIds: string[]; color?: string },
  ) {
    await updateRoutine(id, changes);
    await refresh();
  }

  async function handleToggleFavorite(routine: Routine) {
    await updateRoutine(routine.id, { favorite: !routine.favorite });
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteRoutine(id);
    await refresh();
  }

  const today = todayISODate();
  const plansByRoutine = useMemo(() => {
    const map = new Map<string, PlannedWorkout[]>();
    for (const plan of plans) {
      if (!plan.routineId) continue;
      map.set(plan.routineId, [...(map.get(plan.routineId) ?? []), plan]);
    }
    return map;
  }, [plans]);

  const summary = useMemo(() => {
    const { start, end } = getCurrentWeekRange();
    const plannedThisWeek = plans.filter(
      (p) => p.routineId && p.date >= start && p.date <= end,
    ).length;
    return {
      programCount: routines.length,
      exerciseCount: routines.reduce((sum, r) => sum + r.exerciseIds.length, 0),
      plannedThisWeek,
      favoriteCount: routines.filter((r) => r.favorite).length,
    };
  }, [routines, plans]);

  const visibleRoutines = useMemo(() => {
    const upcomingLimit = toISODate(new Date(parseISODate(today).getTime() + 14 * 86_400_000));
    return routines.filter((routine) => {
      if (filter === "favorites") return Boolean(routine.favorite);
      if (filter === "planned") {
        return (plansByRoutine.get(routine.id) ?? []).some(
          (p) => p.date >= today && p.date <= upcomingLimit,
        );
      }
      return true;
    });
  }, [routines, filter, plansByRoutine, today]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/plan-mountains.jpg" imagePosition="center 55%" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[28px] font-bold text-(--color-text)">Programmer</h1>
          <Button
            variant={isAdding ? "secondary" : "primary"}
            onClick={() => setIsAdding((v) => !v)}
            className="flex-shrink-0"
          >
            {isAdding ? "Annuller" : "+ Nyt program"}
          </Button>
        </div>
        <p className="text-[13px] text-(--color-text-secondary)">
          Opret og gem dine træningsprogrammer, sammensæt øvelser og tilføj dem til kalenderen.
        </p>
      </div>

      {isAdding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <TextField
            label="Navn"
            placeholder="fx Push dag"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <span className="text-[13px] font-medium text-(--color-text-muted)">Øvelser</span>
          <ExerciseMultiSelect
            exercises={exercises}
            selectedIds={newExerciseIds}
            onToggle={toggleNewExercise}
          />
          <span className="text-[13px] font-medium text-(--color-text-muted)">
            Farve (vises i kalenderen)
          </span>
          <RoutineColorPicker value={newColor} onChange={setNewColor} />
          <Button onClick={handleAdd} disabled={!newName.trim() || newExerciseIds.length === 0}>
            Gem program
          </Button>
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && routines.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen programmer endnu. Tryk "+ Nyt program" for at oprette det første.
        </p>
      )}

      {routines.length > 0 && (
        <>
          <SegmentedControl
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
            layout="scroll"
          />

          <div className="flex items-stretch justify-between rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
            <SummaryCell
              icon={IconDumbbell}
              value={String(summary.programCount)}
              label="programmer"
            />
            <div className="w-px flex-shrink-0 bg-(--color-border)" />
            <SummaryCell icon={IconList} value={String(summary.exerciseCount)} label="øvelser" />
            <div className="w-px flex-shrink-0 bg-(--color-border)" />
            <SummaryCell
              icon={IconCalendar}
              value={String(summary.plannedThisWeek)}
              label="planlagt denne uge"
            />
            <div className="w-px flex-shrink-0 bg-(--color-border)" />
            <SummaryCell
              icon={IconStar}
              value={String(summary.favoriteCount)}
              label={summary.favoriteCount === 1 ? "favorit" : "favoritter"}
            />
          </div>
        </>
      )}

      {routines.length > 0 && visibleRoutines.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          {filter === "favorites"
            ? "Ingen favoritter endnu. Tryk på stjernen på et program."
            : "Ingen programmer er planlagt i de kommende to uger."}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {visibleRoutines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            exercises={exercises}
            status={buildStatus(plansByRoutine.get(routine.id) ?? [], today)}
            onUpdate={(changes) => handleUpdate(routine.id, changes)}
            onToggleFavorite={() => handleToggleFavorite(routine)}
            onDelete={() => handleDelete(routine.id)}
          />
        ))}
      </div>
    </div>
  );
}
