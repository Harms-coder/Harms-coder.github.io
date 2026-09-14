import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { BackButton } from "../../components/BackButton";
import { PageBackdrop } from "../../components/PageBackdrop";
import { BADGE_COLORS, BADGE_ICONS } from "../../components/ProgressBadge";
import { listBodyweightEntries } from "../../db/bodyweight";
import { listCardioEntriesInRange } from "../../db/cardio";
import { listExercises } from "../../db/exercises";
import { listGoals } from "../../db/goals";
import { listSessions, listSessionsInRange } from "../../db/sessions";
import { listAllSets } from "../../db/sets";
import { getCurrentWeekRange } from "../../lib/date";
import { computeGoalProgress } from "../../lib/goalProgress";
import { computeBadges, type BadgeKind } from "../../lib/progressBadges";
import { groupSetsByExercise } from "../../lib/strengthGains";
import type { BodyweightEntry, CardioEntry, Exercise, Goal, SetEntry, WorkoutSession } from "../../types";

/** Rækkefølgen på væggen — og teksten, der står, før trofæet er låst op. */
const TROPHIES: { kind: BadgeKind; title: string; locked: string }[] = [
  { kind: "pr", title: "Ny rekord", locked: "Slå din egen rekord i en øvelse." },
  { kind: "oneRm", title: "1RM-rekord", locked: "Sæt en ny rekord for ét løft." },
  { kind: "gain", title: "Fremgang", locked: "Tag mindst 2,5 kg på en øvelse inden for 30 dage." },
  { kind: "streak", title: "Stime", locked: "Træn to gange med højst to dages mellemrum." },
  { kind: "bestMonth", title: "Bedste måned", locked: "Få flere træninger end i nogen tidligere måned." },
  { kind: "goal", title: "Mål nået", locked: "Nå et af dine mål." },
];

/* Hvilke trofæer brugeren allerede har set låst op. Ligger i localStorage, fordi det kun
   handler om animationen på denne telefon — ikke data der skal med i en backup. */
const SEEN_KEY = "vigorra.seenTrophies";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeSeen(kinds: string[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(kinds));
  } catch {
    /* Privat vindue eller fuld disk: så mangler oplåsnings-animationen, og intet andet går galt. */
  }
}

export function AchievementsPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allSets, setAllSets] = useState<SetEntry[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [weekSessions, setWeekSessions] = useState<WorkoutSession[]>([]);
  const [weekCardio, setWeekCardio] = useState<CardioEntry[]>([]);
  const [bodyweight, setBodyweight] = useState<BodyweightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  /* Læses én gang ved første render — altså før noget nyt skrives — så et trofæ, der lige er
     låst op, stadig tæller som nyt, mens man ser på det. */
  const [seenAtLoad] = useState(readSeen);

  useEffect(() => {
    const { start, end } = getCurrentWeekRange();
    void Promise.all([
      listExercises(),
      listAllSets(),
      listSessions(),
      listGoals(),
      listSessionsInRange(start, end),
      listCardioEntriesInRange(start, end),
      listBodyweightEntries(),
    ]).then(
      ([exerciseList, setList, sessionList, goalList, weekSessionList, weekCardioList, weights]) => {
        setExercises(exerciseList);
        setAllSets(setList);
        setSessions(sessionList);
        setGoals(goalList);
        setWeekSessions(weekSessionList);
        setWeekCardio(weekCardioList);
        setBodyweight(weights);
        setLoading(false);
      },
    );
  }, []);

  const setsByExercise = useMemo(() => groupSetsByExercise(allSets), [allSets]);

  const earned = useMemo(() => {
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));
    const goalProgress = goals.map((goal) =>
      computeGoalProgress(goal, {
        sessionsThisWeek: weekSessions,
        cardioThisWeek: weekCardio,
        latestBodyweight: bodyweight[0],
        exerciseById,
      }),
    );
    const badges = computeBadges({ exercises, setsByExercise, sessions, goalProgress });
    return new Map(badges.map((badge) => [badge.kind, badge.label]));
  }, [exercises, setsByExercise, sessions, goals, weekSessions, weekCardio, bodyweight]);

  /*
   * Først når siden har stået åben et par sekunder, tæller trofæerne som set — så når glimtet
   * at blive vist. Ryddes ved unmount, så et hurtigt kig ikke bruger oplåsningen op.
   */
  useEffect(() => {
    if (loading) return;
    const id = setTimeout(() => writeSeen([...earned.keys()]), 2500);
    return () => clearTimeout(id);
  }, [loading, earned]);

  const unlockedCount = earned.size;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/mal-summit.jpg" imagePosition="center 55%" />
      <BackButton />
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-(--color-text)">Præstationer</h1>
        <span className="text-[13px] text-(--color-text-muted)">
          {unlockedCount} af {TROPHIES.length} låst op
        </span>
      </div>

      {loading ? (
        <p className="text-[13px] text-(--color-text-muted)">Indlæser…</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {TROPHIES.map(({ kind, title, locked }) => {
            const label = earned.get(kind);
            const Icon = BADGE_ICONS[kind];
            const color = BADGE_COLORS[kind];
            const isNew = label !== undefined && !seenAtLoad.includes(kind);
            return (
              <div
                key={kind}
                style={{ "--badge-color": color } as CSSProperties}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center card-shadow ${
                  label
                    ? `trophy-on ${isNew ? "trophy-unlock" : ""}`
                    : "border-(--color-border) bg-(--color-surface) opacity-55"
                }`}
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    label ? "cat-fill" : "bg-(--color-surface-2)"
                  }`}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: label ? "var(--color-text-on-accent)" : "var(--color-text-dim)" }}
                  />
                </span>
                <span className="text-[14px] font-semibold text-(--color-text)">{title}</span>
                <span className="text-[12px] leading-snug text-(--color-text-secondary)">
                  {label ?? locked}
                </span>
                {isNew && (
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-(--color-cat-record)">
                    NYT
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[12.5px] text-(--color-text-muted)">
        Rekorder og stimer tælles fra de seneste dage, så et trofæ kan låse sig selv igen, hvis der
        går for lang tid. Så er der bare noget at gå efter.
      </p>
    </div>
  );
}
