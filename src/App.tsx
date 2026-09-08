import { lazy, Suspense, type ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { CardioPage } from "./features/cardio/CardioPage";
import { DemoSeedPage } from "./features/demo/DemoSeedPage";
import { ExercisesPage } from "./features/exercises/ExercisesPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { OverviewPage } from "./features/overview/OverviewPage";
import { PlanPage } from "./features/plan/PlanPage";
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
  return (
    <div className="min-h-full bg-(--color-bg) pb-24">
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/traening" element={<TrainingPage />} />
        <Route path="/cardio" element={<CardioPage />} />
        <Route
          path="/progression"
          element={
            <LazyPage>
              <ProgressionPage />
            </LazyPage>
          }
        />
        <Route path="/oevelser" element={<ExercisesPage />} />
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
        <Route path="/demo" element={<DemoSeedPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
