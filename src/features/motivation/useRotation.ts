import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listQuotes } from "../../db/quotes";
import { dayNumber, rotationOf } from "../../lib/quotes";
import type { Quote } from "../../types";

/**
 * Citaterne i rotation (stjernede, ellers alle) og dagens citat blandt dem.
 * Tom liste indtil databasen er læst — vis så ingenting frem for et forkert citat.
 * Læses igen ved sideskift, så bundmenuens rulletekst følger med, når stjernerne ændres på /motivation.
 */
export function useRotation() {
  const [rotation, setRotation] = useState<Quote[]>([]);
  const { pathname } = useLocation();
  useEffect(() => {
    void listQuotes().then((all) => setRotation(rotationOf(all)));
  }, [pathname]);
  const today = rotation.length > 0 ? rotation[dayNumber() % rotation.length] : undefined;
  return { rotation, today };
}
