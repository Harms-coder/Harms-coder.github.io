import { useState } from "react";
import { GoalProgress } from "../../components/GoalProgress";
import { IconTrophy } from "../../components/icons";
import { GOAL_TYPE_LABELS } from "../../db/goals";
import { GoalCardHeader } from "./GoalCardHeader";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";
import { GoalTargetEditForm } from "./GoalTargetEditForm";

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
      <GoalCardHeader
        icon={IconTrophy}
        title={GOAL_TYPE_LABELS[goal.type]}
        color="var(--color-cat-record)"
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
      />

      {isEditing ? (
        <GoalTargetEditForm
          target={target}
          onTargetChange={setTarget}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex items-center gap-4">
          <GoalProgress
            variant="circular"
            label={progress.label}
            statusText={progress.statusText}
            percent={progress.percent}
            color="var(--color-cat-record)"
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
