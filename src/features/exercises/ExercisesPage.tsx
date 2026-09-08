import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import {
  createExercise,
  deleteExercise,
  listExercises,
  updateExercise,
} from "../../db/exercises";
import type { Exercise } from "../../types";
import { ExerciseCard } from "./ExerciseCard";

export function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const all = await listExercises();
    setExercises(all);
    setLoading(false);
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    await createExercise({ name: newName, category: newCategory || undefined });
    setNewName("");
    setNewCategory("");
    setIsAdding(false);
    await refresh();
  }

  async function handleUpdate(
    id: string,
    changes: Parameters<typeof updateExercise>[1],
  ) {
    await updateExercise(id, changes);
    await refresh();
  }

  async function handleDelete(id: string) {
    await deleteExercise(id);
    await refresh();
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--color-text)">Øvelser</h1>
        <Button
          variant={isAdding ? "secondary" : "primary"}
          onClick={() => setIsAdding((value) => !value)}
        >
          {isAdding ? "Annuller" : "+ Tilføj"}
        </Button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
        >
          <TextField
            label="Navn"
            placeholder="fx Flad bænk med vægtstang"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <TextField
            label="Kategori (valgfri)"
            placeholder="fx Bryst"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <Button type="submit">Gem øvelse</Button>
        </form>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && exercises.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen øvelser endnu. Tryk "+ Tilføj" for at oprette den første.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdate={(changes) => handleUpdate(exercise.id, changes)}
            onDelete={() => handleDelete(exercise.id)}
          />
        ))}
      </div>
    </div>
  );
}
