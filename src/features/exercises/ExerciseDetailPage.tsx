import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { CategoryPicker } from "../../components/CategoryPicker";
import { IconChevronLeft } from "../../components/icons";
import { TextField } from "../../components/TextField";
import { deleteExercise, getExercise, updateExercise } from "../../db/exercises";
import type { Exercise } from "../../types";
import { ExercisePhotoThumb } from "./ExercisePhotoThumb";

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [pr1RM, setPr1RM] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getExercise(id).then((found) => {
      if (found) {
        setExercise(found);
        setName(found.name);
        setCategory(found.category);
        setDescription(found.description ?? "");
        setPrWeight(found.prWeight?.toString() ?? "");
        setPrReps(found.prReps?.toString() ?? "");
        setPr1RM(found.pr1RM?.toString() ?? "");
      }
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    if (!id || !name.trim()) return;
    const hasPr = prWeight.trim() !== "" || prReps.trim() !== "";
    const has1RM = pr1RM.trim() !== "";
    await updateExercise(id, {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      prWeight: prWeight.trim() ? Number(prWeight) : undefined,
      prReps: prReps.trim() ? Number(prReps) : undefined,
      prDate: hasPr ? new Date().toISOString() : undefined,
      pr1RM: has1RM ? Number(pr1RM) : undefined,
      pr1RMDate: has1RM ? new Date().toISOString() : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function handleDelete() {
    if (!id || !exercise) return;
    if (!window.confirm(`Slet "${exercise.name}"? Dette kan ikke fortrydes.`)) return;
    await deleteExercise(id);
    navigate("/oevelser");
  }

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  if (!exercise) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-6">
        <p className="text-sm text-(--color-text-muted)">Øvelsen blev ikke fundet.</p>
        <Link to="/oevelser" className="text-(--color-accent)">
          ← Tilbage til øvelser
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-8">
      <button
        type="button"
        onClick={() => navigate("/oevelser")}
        className="flex items-center gap-1 self-start text-[13px] font-medium text-(--color-text-muted) active:opacity-70"
      >
        <IconChevronLeft className="h-4 w-4" />
        Øvelser
      </button>

      <div className="flex justify-center">
        <div className="h-32 w-32 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface-2) card-shadow">
          <ExercisePhotoThumb exercise={{ name, category }} />
        </div>
      </div>

      <TextField label="Navn" value={name} onChange={(e) => setName(e.target.value)} />

      <span className="text-[13px] font-medium text-(--color-text-muted)">Kategori (valgfri)</span>
      <CategoryPicker value={category} onChange={setCategory} />

      <TextField
        label="Beskrivelse (valgfri, én linje)"
        placeholder="fx Primært target bryst og triceps"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          Personlige rekorder
        </span>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tungeste sæt – vægt (kg)"
            type="number"
            inputMode="decimal"
            value={prWeight}
            onChange={(e) => setPrWeight(e.target.value)}
          />
          <TextField
            label="Tungeste sæt – reps"
            type="number"
            inputMode="numeric"
            value={prReps}
            onChange={(e) => setPrReps(e.target.value)}
          />
        </div>
        <TextField
          label="1RM (kg) – hvad du kan tage i én rep"
          type="number"
          inputMode="decimal"
          value={pr1RM}
          onChange={(e) => setPr1RM(e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={!name.trim()}>
        {saved ? "Gemt ✓" : "Gem"}
      </Button>

      <Button variant="danger" onClick={handleDelete}>
        Slet øvelse
      </Button>
    </div>
  );
}
