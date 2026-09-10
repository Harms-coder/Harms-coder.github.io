import { useState } from "react";
import { AxisTrendChart } from "../../components/AxisTrendChart";
import { CardActions } from "../../components/CardActions";
import { GoalProgress } from "../../components/GoalProgress";
import { IconCalendar, IconTarget } from "../../components/icons";
import { DA_MONTHS, formatMediumDate, parseISODate, toISODate } from "../../lib/date";
import type { GoalProgress as GoalProgressData } from "../../lib/goalProgress";
import type { BodyweightEntry } from "../../types";
import { GoalTargetEditForm } from "./GoalTargetEditForm";

const CHART_ENTRY_COUNT = 10;
const MAX_PROJECTION_DAYS = 3650;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function monthAbbrev(dateISO: string): string {
  const name = DA_MONTHS[parseISODate(dateISO).getMonth()].slice(0, 3);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Viser kun månedsnavnet ved første punkt i hver måned, så x-aksen ikke gentager sig punkt for punkt. */
function sparseMonthLabels(entries: BodyweightEntry[]): string[] {
  let lastMonth = "";
  return entries.map((entry) => {
    const label = monthAbbrev(entry.date);
    if (label === lastMonth) return "";
    lastMonth = label;
    return label;
  });
}

/** Lineær fremskrivning ud fra den seneste vægt-trend, af hvornår kropsvægtsmålet nås. undefined hvis der ikke er nok data eller trenden går væk fra målet. */
function computeProjectedGoalDate(recentAscending: BodyweightEntry[], target: number): string | undefined {
  if (recentAscending.length < 2) return undefined;
  const first = recentAscending[0];
  const last = recentAscending[recentAscending.length - 1];
  const daysBetween = (parseISODate(last.date).getTime() - parseISODate(first.date).getTime()) / 86_400_000;
  if (daysBetween <= 0) return undefined;

  const ratePerDay = (last.weight - first.weight) / daysBetween;
  const remaining = target - last.weight;
  if (Math.abs(ratePerDay) < 0.001) return undefined;
  if ((remaining > 0 && ratePerDay <= 0) || (remaining < 0 && ratePerDay >= 0)) return undefined;

  const daysNeeded = remaining / ratePerDay;
  if (!Number.isFinite(daysNeeded) || daysNeeded <= 0 || daysNeeded > MAX_PROJECTION_DAYS) return undefined;

  const projected = parseISODate(last.date);
  projected.setDate(projected.getDate() + Math.round(daysNeeded));
  return toISODate(projected);
}

interface BodyweightGoalCardProps {
  progress: GoalProgressData;
  bodyweightEntries: BodyweightEntry[];
  onUpdate: (target: number) => Promise<void> | void;
  onDelete: () => Promise<void> | void;
}

export function BodyweightGoalCard({
  progress,
  bodyweightEntries,
  onUpdate,
  onDelete,
}: BodyweightGoalCardProps) {
  const { goal, current, target, achieved } = progress;
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

  const recentAscending = [...bodyweightEntries].slice(0, CHART_ENTRY_COUNT).reverse();
  const projectedDate = computeProjectedGoalDate(recentAscending, target);
  const remaining = round1(Math.abs(target - current));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTarget className="h-5 w-5 text-(--color-text-secondary)" />
          <span className="text-[15px] font-semibold text-(--color-text)">Mål-kropsvægt</span>
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
                {current} / {target} kg
              </span>
              <span className="text-[13px] text-(--color-text-muted)">
                {achieved ? "Mål nået" : `${remaining} kg tilbage`}
              </span>
              {projectedDate && (
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-(--color-accent-bright)">
                  <IconCalendar className="h-3.5 w-3.5" />
                  Forventet mål: {formatMediumDate(parseISODate(projectedDate))}
                </span>
              )}
            </div>
          </div>

          {recentAscending.length >= 2 && (
            <AxisTrendChart
              values={recentAscending.map((e) => e.weight)}
              labels={sparseMonthLabels(recentAscending)}
              projection={projectedDate ? { value: target, label: monthAbbrev(projectedDate) } : undefined}
              height={46}
            />
          )}
        </>
      )}
    </div>
  );
}
