import { Link, useNavigate } from "react-router-dom";
import { CardActions } from "../../components/CardActions";
import type { Exercise } from "../../types";
import { ExercisePhotoThumb } from "./ExercisePhotoThumb";

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete: () => Promise<void> | void;
}

export function ExerciseCard({ exercise, onDelete }: ExerciseCardProps) {
  const navigate = useNavigate();

  function handleDelete() {
    if (window.confirm(`Slet "${exercise.name}"? Dette kan ikke fortrydes.`)) {
      void onDelete();
    }
  }

  const hasPr = exercise.prWeight !== undefined || exercise.prReps !== undefined;

  return (
    <div className="flex min-h-28 items-stretch overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) card-shadow">
      <Link to={`/oevelser/${exercise.id}`} className="flex min-w-0 flex-1 items-stretch">
        <ExercisePhotoThumb exercise={exercise} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-4">
          <span className="truncate text-[15px] font-medium text-(--color-text)">
            {exercise.name}
          </span>
          {exercise.category && (
            <span className="w-fit rounded-full bg-(--color-cat-library)/12 px-2 py-0.5 text-[12px] font-medium text-(--color-cat-library)">
              {exercise.category}
            </span>
          )}
          {hasPr && (
            <span className="text-[13px] font-medium text-(--color-cat-strength)">
              Tungeste sæt: {exercise.prWeight !== undefined ? `${exercise.prWeight} kg` : ""}
              {exercise.prWeight !== undefined && exercise.prReps !== undefined ? " × " : ""}
              {exercise.prReps !== undefined ? `${exercise.prReps}` : ""}
            </span>
          )}
          {exercise.pr1RM !== undefined && (
            <span className="text-[13px] font-medium text-(--color-cat-record)">
              1RM: {exercise.pr1RM} kg
            </span>
          )}
        </div>
      </Link>
      <div className="flex items-center pr-3">
        <CardActions onEdit={() => navigate(`/oevelser/${exercise.id}`)} onDelete={handleDelete} />
      </div>
    </div>
  );
}
