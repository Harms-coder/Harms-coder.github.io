import { useEffect, useState } from "react";
import { IconChevronDown } from "../../components/icons";
import { listExercises } from "../../db/exercises";
import { listSessions } from "../../db/sessions";
import { listSetsForSession } from "../../db/sets";
import { formatLongDate, parseISODate } from "../../lib/date";
import type { Exercise, SetEntry, WorkoutSession } from "../../types";

interface SessionWithSets {
  session: WorkoutSession;
  sets: SetEntry[];
}

export function HistoryPage() {
  const [entries, setEntries] = useState<SessionWithSets[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    const [allSessions, allExercises] = await Promise.all([listSessions(), listExercises()]);
    const withSets = await Promise.all(
      allSessions.map(async (session) => ({
        session,
        sets: await listSetsForSession(session.id),
      })),
    );
    setEntries(withSets.filter((entry) => entry.sets.length > 0));
    setExercises(allExercises);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));

  if (loading) {
    return <p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">Historik</h1>

      {entries.length === 0 && (
        <p className="text-sm text-(--color-text-muted)">
          Du har ingen gennemførte træninger endnu.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {entries.map(({ session, sets }) => {
          const expanded = expandedId === session.id;
          const exerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
          return (
            <div
              key={session.id}
              className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : session.id)}
                className="flex items-center justify-between text-left"
              >
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-(--color-text)">
                    {formatLongDate(parseISODate(session.date))}
                  </span>
                  <span className="text-[13px] text-(--color-text-muted)">
                    {exerciseIds.length} øvelser
                    {session.durationMin ? ` · ${session.durationMin} min` : ""}
                    {!session.endedAt ? " · i gang" : ""}
                  </span>
                </div>
                <IconChevronDown
                  className={`h-5 w-5 text-(--color-text-muted) transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>

              {expanded && (
                <div className="flex flex-col gap-2 border-t border-(--color-border) pt-3">
                  {exerciseIds.map((exerciseId) => {
                    const exerciseSets = sets.filter((s) => s.exerciseId === exerciseId);
                    return (
                      <div key={exerciseId} className="flex flex-col gap-0.5">
                        <span className="text-[14px] font-medium text-(--color-text)">
                          {exerciseById.get(exerciseId)?.name ?? "Ukendt øvelse"}
                        </span>
                        <span className="text-[13px] text-(--color-text-muted)">
                          {exerciseSets.map((s) => `${s.weight}×${s.reps}`).join(", ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
