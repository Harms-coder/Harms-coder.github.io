import { useState } from "react";
import { CardActions } from "../../components/CardActions";
import { Button } from "../../components/Button";
import { GoalProgress } from "../../components/GoalProgress";
import { TextField } from "../../components/TextField";
import { GOAL_TYPE_LABELS } from "../../db/goals";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";

interface GoalCardProps {
  progress: GoalProgressData;
  onUpdate: (target: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function GoalCard({ progress, onUpdate, onDelete }: GoalCardProps) {
  const { goal } = progress;
  const [isEditing, setIsEditing] = useState(false);
  const [target, setTarget] = useState(String(goal.target));

  async function handleSave() {
    const parsed = Number(target);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    await onUpdate(parsed);
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm("Slet dette mål?")) void onDelete();
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          {GOAL_TYPE_LABELS[goal.type]}
        </span>
        <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
      </div>

      {isEditing ? (
        <div className="flex items-end gap-2">
          <TextField
            label="Mål"
            type="number"
            inputMode="decimal"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSave}>Gem</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Annuller
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <GoalProgress
            variant="circular"
            label={progress.label}
            statusText={progress.statusText}
            percent={progress.percent}
          />
          {goal.exerciseId && (
            <span className="flex-1 text-[15px] font-medium text-(--color-text)">
              {progress.label}
            </span>
          )}
        </div>
      )}

      {progress.achieved && !isEditing && (
        <span className="text-[12px] font-semibold text-(--color-success)">Mål nået</span>
      )}
    </div>
  );
}
