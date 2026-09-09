import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { ExerciseMultiSelect } from "../../components/ExerciseMultiSelect";
import { PageBackdrop } from "../../components/PageBackdrop";
import { RoutineColorPicker } from "../../components/RoutineColorPicker";
import { TextField } from "../../components/TextField";
import { listExercises } from "../../db/exercises";
import {
  createRoutine,
  deleteRoutine,
  listRoutines,
  ROUTINE_COLORS,
  updateRoutine,
} from "../../db/routines";
import type { Exercise, Routine } from "../../types";
import { RoutineCard } from "./RoutineCard";

export function PlanPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newExerciseIds, setNewExerciseIds] = useState<string[]>([]);
  const [newColor, setNewColor] = useState<string>(ROUTINE_COLORS[0]);

  async function refresh() {
    const [allRoutines, allExercises] = await Promise.all([listRoutines(), listExercises()]);
    setRoutines(allRoutines);
    setExercises(allExercises);
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

  async function handleDelete(id: string) {
    await deleteRoutine(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/plan-mountains.jpg" imagePosition="center 55%" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--color-text)">Min Plan</h1>
        <Button
          variant={isAdding ? "secondary" : "primary"}
          onClick={() => setIsAdding((v) => !v)}
        >
          {isAdding ? "Annuller" : "+ Ny gruppe"}
        </Button>
      </div>
      <p className="text-sm text-(--color-text-muted)">
        Saml øvelser i grupper (fx "Træning 1", "Træning 2"), så du hurtigt kan lægge en hel
        træning ind i kalenderen.
      </p>

      {isAdding && (
        <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
          <TextField
            label="Navn"
            placeholder="fx Træning 1"
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
            Gem gruppe
          </Button>
        </div>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && routines.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen grupper endnu. Tryk "+ Ny gruppe" for at oprette den første.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {routines.map((routine) => (
          <RoutineCard
            key={routine.id}
            routine={routine}
            exercises={exercises}
            onUpdate={(changes) => handleUpdate(routine.id, changes)}
            onDelete={() => handleDelete(routine.id)}
          />
        ))}
      </div>
    </div>
  );
}
