import { Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { BodyweightPage } from "./features/bodyweight/BodyweightPage";
import { CalendarPage } from "./features/calendar/CalendarPage";
import { CardioPage } from "./features/cardio/CardioPage";
import { ExercisesPage } from "./features/exercises/ExercisesPage";
import { HistoryPage } from "./features/history/HistoryPage";
import { OverviewPage } from "./features/overview/OverviewPage";
import { PlanPage } from "./features/plan/PlanPage";
import { ProgressionPage } from "./features/progression/ProgressionPage";
import { TrainingPage } from "./features/training/TrainingPage";

function App() {
  return (
    <div className="min-h-full bg-(--color-bg) pb-24">
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/traening" element={<TrainingPage />} />
        <Route path="/cardio" element={<CardioPage />} />
        <Route path="/progression" element={<ProgressionPage />} />
        <Route path="/oevelser" element={<ExercisesPage />} />
        <Route path="/kalender" element={<CalendarPage />} />
        <Route path="/historik" element={<HistoryPage />} />
        <Route path="/kropsvaegt" element={<BodyweightPage />} />
        <Route path="/plan" element={<PlanPage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

export default App;
