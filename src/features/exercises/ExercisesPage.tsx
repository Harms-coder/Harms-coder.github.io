import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../../components/Button";
import { CategoryPicker } from "../../components/CategoryPicker";
import { ExerciseFilterBar } from "../../components/ExerciseFilterBar";
import { IconChevronRight } from "../../components/icons";
import { PageBackdrop } from "../../components/PageBackdrop";
import { TextField } from "../../components/TextField";
import { createExercise, deleteExercise, listExercises } from "../../db/exercises";
import { filterExercises } from "../../lib/exerciseFilter";
import type { Exercise } from "../../types";
import { ExerciseCard } from "./ExerciseCard";

export function ExercisesPage() {
  const location = useLocation();
  const filterIds = (location.state as { filterIds?: string[] } | null)?.filterIds;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showingFiltered, setShowingFiltered] = useState(Boolean(filterIds?.length));

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

  async function handleDelete(id: string) {
    await deleteExercise(id);
    await refresh();
  }

  const filtered = useMemo(() => {
    const base =
      showingFiltered && filterIds?.length
        ? exercises.filter((e) => filterIds.includes(e.id))
        : exercises;
    return filterExercises(base, category, query);
  }, [exercises, category, query, showingFiltered, filterIds]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/ovelser-weights.jpg" imagePosition="center 40%" />
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] font-bold text-(--color-text)">Øvelser</h1>
          <p className="text-[13px] text-(--color-text-secondary)">
            Byg din styrke. Ét løft ad gangen.
          </p>
        </div>
        <Button
          variant={isAdding ? "secondary" : "primary"}
          tone="library"
          onClick={() => setIsAdding((value) => !value)}
        >
          {isAdding ? "Annuller" : "+ Tilføj"}
        </Button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow"
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
          <Button type="submit" tone="library">
            Gem øvelse
          </Button>
        </form>
      )}

      {loading && <p className="text-sm text-(--color-text-muted)">Indlæser…</p>}

      {!loading && exercises.length === 0 && !isAdding && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen øvelser endnu. Tryk "+ Tilføj" for at oprette den første.
        </p>
      )}

      {showingFiltered && (
        <div className="flex items-center justify-between rounded-xl border border-(--color-border-accent) bg-(--color-surface-2) px-3.5 py-2">
          <span className="text-[13px] text-(--color-text-secondary)">
            Viser {filterIds?.length} øvelse{filterIds?.length === 1 ? "" : "r"}
          </span>
          <button
            type="button"
            onClick={() => setShowingFiltered(false)}
            className="flex items-center gap-1 text-[13px] font-medium text-(--color-cat-library)"
          >
            Vis alle
            <IconChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
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
            onDelete={() => handleDelete(exercise.id)}
          />
        ))}
      </div>
    </div>
  );
}
