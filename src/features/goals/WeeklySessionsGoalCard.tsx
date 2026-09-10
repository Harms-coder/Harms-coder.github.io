import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { GoalProgress } from "../../components/GoalProgress";
import { IconCheck, IconDumbbell, IconFlame, IconPlay } from "../../components/icons";
import { GoalCardHeader } from "./GoalCardHeader";
import { startSession } from "../../db/sessions";
import { DA_WEEKDAYS_SHORT, parseISODate, toISODate } from "../../lib/date";
import { computeWeeklyStreak } from "../../lib/streak";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";
import type { WorkoutSession } from "../../types";
import { GoalTargetEditForm } from "./GoalTargetEditForm";

interface WeeklySessionsGoalCardProps {
  progress: GoalProgressData;
  weekSessions: WorkoutSession[];
  allSessions: WorkoutSession[];
  weekStartISO: string;
  onUpdate: (target: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function WeeklySessionsGoalCard({
  progress,
  weekSessions,
  allSessions,
  weekStartISO,
  onUpdate,
  onDelete,
}: WeeklySessionsGoalCardProps) {
  const { goal, current, target, achieved } = progress;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [targetInput, setTargetInput] = useState(String(goal.target));

  async function handleSave() {
    const parsed = Number(targetInput);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    await onUpdate(parsed);
    setIsEditing(false);
  }

  function handleDelete() {
    if (window.confirm("Slet dette mål?")) void onDelete();
  }

  async function handleStart() {
    await startSession();
    navigate("/traening/live");
  }

  const weekStart = parseISODate(weekStartISO);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const completedDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const iso = toISODate(d);
    return weekSessions.some((s) => s.date === iso && s.endedAt);
  });
  const streak = computeWeeklyStreak(allSessions, goal.target, weekStartISO);
  const remaining = Math.max(0, target - current);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <GoalCardHeader
        icon={IconDumbbell}
        title="Træninger pr. uge"
        color="var(--color-cat-strength)"
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
      />

      {isEditing ? (
        <GoalTargetEditForm
          target={targetInput}
          onTargetChange={setTargetInput}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex items-center gap-4">
            <GoalProgress
              variant="circular"
              size={72}
              label=""
              statusText=""
              percent={progress.percent}
              color="var(--color-cat-strength)"
            />
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-semibold text-(--color-text)">
                {current} / {target} træninger
              </span>
              <span className="text-[13px] text-(--color-text-muted)">
                {achieved ? "Mål nået" : `${remaining} træning${remaining === 1 ? "" : "er"} tilbage`}
              </span>
              {streak > 0 && (
                <span className="flex items-center gap-1 text-[13px] font-medium text-(--color-cat-strength)">
                  <IconFlame className="h-3.5 w-3.5" />
                  {streak} ugers streak
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {DA_WEEKDAYS_SHORT.map((day, i) => {
                const isCompleted = completedDays[i];
                const isToday = i === todayIndex;
                return (
                  <div key={day} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-medium text-(--color-text-muted)">{day[0]}</span>
                    <span
                      style={
                        { "--badge-color": "var(--color-cat-strength)" } as CSSProperties
                      }
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border ${
                        isCompleted
                          ? "cat-fill border-transparent"
                          : isToday
                            ? "border-2 border-(--color-cat-strength)"
                            : "border-(--color-border)"
                      }`}
                    >
                      {isCompleted && <IconCheck className="h-2.5 w-2.5 text-(--color-text)" />}
                    </span>
                  </div>
                );
              })}
            </div>

            <Button size="sm" tone="strength" onClick={handleStart} className="flex flex-shrink-0 items-center gap-1.5">
              <IconPlay className="h-3.5 w-3.5" />
              Start træning
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
