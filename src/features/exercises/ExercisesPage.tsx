import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { CategoryPicker } from "../../components/CategoryPicker";
import { ExerciseFilterBar } from "../../components/ExerciseFilterBar";
import { TextField } from "../../components/TextField";
import {
  createExercise,
  deleteExercise,
  listExercises,
  updateExercise,
} from "../../db/exercises";
import { filterExercises } from "../../lib/exerciseFilter";
import type { Exercise } from "../../types";
import { ExerciseCard } from "./ExerciseCard";

export function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  async function refresh() {
    const all = await listExercises();
    setExercises(all);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    await createExercise({ name: newName, category: newCategory });
    setNewName("");
    setNewCategory(undefined);
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

  const filtered = useMemo(
    () => filterExercises(exercises, category, query),
    [exercises, category, query],
  );

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
          <span className="text-[13px] font-medium text-(--color-text-muted)">
            Kategori (valgfri)
          </span>
          <CategoryPicker value={newCategory} onChange={setNewCategory} />
          <Button type="submit">Gem øvelse</Button>
        </form>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && exercises.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen øvelser endnu. Tryk "+ Tilføj" for at oprette den første.
        </p>
      )}

      {exercises.length > 0 && (
        <ExerciseFilterBar
          query={query}
          onQueryChange={setQuery}
          category={category}
          onCategoryChange={setCategory}
        />
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((exercise) => (
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
