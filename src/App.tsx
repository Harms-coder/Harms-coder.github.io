import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Route, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { PageSwiper } from "./components/PageSwiper";
import { AchievementsPage } from "./features/achievements/AchievementsPage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { CardioPage } from "./features/cardio/CardioPage";
import { BackupPage } from "./features/data/BackupPage";
import { MorePage } from "./features/more/MorePage";
import { DemoSeedPage } from "./features/demo/DemoSeedPage";
import { ExerciseDetailPage } from "./features/exercises/ExerciseDetailPage";
import { ExercisesPage } from "./features/exercises/ExercisesPage";
import { GoalsPage } from "./features/goals/GoalsPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { MotivationPage } from "./features/motivation/MotivationPage";
import { OverviewPage } from "./features/overview/OverviewPage";
import { PlanPage } from "./features/plan/PlanPage";
import { LiveTrainingPage } from "./features/training/LiveTrainingPage";
import { TrainingPage } from "./features/training/TrainingPage";

// Recharts er tung (~375 kB), så siderne der bruger den lazy-loades
// for at holde hoved-bundlen let.
const ProgressionPage = lazy(() =>
  import("./features/progression/ProgressionPage").then((m) => ({
    default: m.ProgressionPage,
  })),
);
const BodyweightPage = lazy(() =>
  import("./features/bodyweight/BodyweightPage").then((m) => ({
    default: m.BodyweightPage,
  })),
);
const MinutesPage = lazy(() =>
  import("./features/minutes/MinutesPage").then((m) => ({ default: m.MinutesPage })),
);
const DistancePage = lazy(() =>
  import("./features/distance/DistancePage").then((m) => ({ default: m.DistancePage })),
);

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<p className="px-4 pt-6 text-sm text-(--color-text-muted)">Indlæser…</p>}
    >
      {children}
    </Suspense>
  );
}

function App() {
  const location = useLocation();
  const hideBottomNav = location.pathname === "/traening/live";

  // #root er selv rullefladen, så browseren nulstiller ikke rul ved sideskift — en ny side
  // startede ellers dér, hvor den forrige var rullet til (fx live-træning uden Afslut synlig).
  useEffect(() => {
    document.getElementById("root")?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={`relative min-h-full ${hideBottomNav ? "" : "pb-[calc(6rem+env(safe-area-inset-bottom,0px))]"}`}>
      <div className="app-ambience" />
      <PageSwiper>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/motivation" element={<MotivationPage />} />
        <Route path="/traening" element={<TrainingPage />} />
        <Route path="/traening/live" element={<LiveTrainingPage />} />
        <Route path="/cardio" element={<CardioPage />} />
        <Route
          path="/progression"
          element={
            <LazyPage>
              <ProgressionPage />
            </LazyPage>
          }
        />
        <Route path="/praestationer" element={<AchievementsPage />} />
        <Route path="/oevelser" element={<ExercisesPage />} />
        <Route path="/oevelser/:id" element={<ExerciseDetailPage />} />
        <Route path="/kalender" element={<CalendarPage />} />
        <Route path="/historik" element={<HistoryPage />} />
        <Route
          path="/kropsvaegt"
          element={
            <LazyPage>
              <BodyweightPage />
            </LazyPage>
          }
        />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/mal" element={<GoalsPage />} />
        <Route
          path="/minutter"
          element={
            <LazyPage>
              <MinutesPage />
            </LazyPage>
          }
        />
        <Route
          path="/kilometer"
          element={
            <LazyPage>
              <DistancePage />
            </LazyPage>
          }
        />
        <Route path="/mere" element={<MorePage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/demo" element={<DemoSeedPage />} />
      </PageSwiper>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

export default App;
