import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxisTrendChart } from "../../components/AxisTrendChart";
import { Button } from "../../components/Button";
import { CardActions } from "../../components/CardActions";
import { GoalProgress } from "../../components/GoalProgress";
import { IconPlay, IconRun } from "../../components/icons";
import { DA_WEEKDAYS_SHORT, parseISODate } from "../../lib/date";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";
import type { CardioEntry } from "../../types";
import { GoalTargetEditForm } from "./GoalTargetEditForm";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

interface WeeklyDistanceGoalCardProps {
  progress: GoalProgressData;
  weekCardio: CardioEntry[];
  onUpdate: (target: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function WeeklyDistanceGoalCard({
  progress,
  weekCardio,
  onUpdate,
  onDelete,
}: WeeklyDistanceGoalCardProps) {
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

  const todayIndex = (new Date().getDay() + 6) % 7;
  const perDay = Array(7).fill(0) as number[];
  for (const entry of weekCardio) {
    const idx = (parseISODate(entry.date).getDay() + 6) % 7;
    perDay[idx] += entry.distanceKm;
  }
  const cumulative: number[] = [];
  let running = 0;
  for (const km of perDay) {
    running += km;
    cumulative.push(round1(running));
  }

  const remaining = round1(Math.max(0, target - current));
  const expectedByNow = round1(target * ((todayIndex + 1) / 7));
  const onPace = achieved || current >= expectedByNow;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconRun className="h-5 w-5 text-(--color-text-secondary)" />
          <span className="text-[15px] font-semibold text-(--color-text)">Km pr. uge</span>
        </div>
        <CardActions onEdit={() => setIsEditing(true)} onDelete={handleDelete} />
      </div>

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
            <GoalProgress variant="circular" size={72} label="" statusText="" percent={progress.percent} />
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-semibold text-(--color-text)">
                {current} / {target} km
              </span>
              <span className="text-[13px] text-(--color-text-muted)">
                {achieved ? "Mål nået" : `${remaining} km tilbage`}
              </span>
              <span
                className={`flex items-center gap-1.5 text-[13px] font-medium ${
                  onPace ? "text-(--color-success)" : "text-(--color-danger)"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${onPace ? "bg-(--color-success)" : "bg-(--color-danger)"}`}
                />
                {onPace ? "På rette vej" : "Lidt bagud"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              {cumulative.some((v) => v > 0) && (
                <AxisTrendChart values={cumulative} labels={DA_WEEKDAYS_SHORT} includeZero height={46} />
              )}
            </div>

            <Button
              size="sm"
              onClick={() => navigate("/cardio", { state: { autoAdd: true } })}
              className="flex flex-shrink-0 items-center gap-1.5"
            >
              <IconPlay className="h-3.5 w-3.5" />
              Start løb
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
