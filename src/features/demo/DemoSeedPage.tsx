import { useState } from "react";
import { Button } from "../../components/Button";
import { generateDemoHistory } from "../../db/demoSeed";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "done"; sessionCount: number; setCount: number; cardioCount: number; weightCount: number }
  | { kind: "error"; message: string };

export function DemoSeedPage() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSeed() {
    if (
      !window.confirm(
        "Dette tilføjer ca. 6 måneders eksempeldata (træninger, cardio, kropsvægt, rutiner) oven i det du allerede har. Fortsæt?",
      )
    ) {
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const result = await generateDemoHistory();
      setStatus({ kind: "done", ...result });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Ukendt fejl" });
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-2xl font-semibold text-(--color-text)">Eksempeldata</h1>
      <p className="text-sm text-(--color-text-muted)">
        Tilføjer ca. 6 måneders realistisk brugshistorik (træninger med stigende vægt, cardio,
        kropsvægt og et par øvelsesgrupper), så du kan se hvordan appen ser ud efter noget tids
        brug. Kan ikke fortrydes bagefter, kun ryddes manuelt igen.
      </p>

      <Button onClick={handleSeed} disabled={status.kind === "loading"}>
        {status.kind === "loading" ? "Genererer…" : "Indlæs 6 måneders eksempeldata"}
      </Button>

      {status.kind === "done" && (
        <div className="flex flex-col gap-1 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 text-[14px] text-(--color-text)">
          <span>Færdig! Tilføjede:</span>
          <span className="text-(--color-text-muted)">
            {status.sessionCount} træninger · {status.setCount} sæt · {status.cardioCount}{" "}
            løbeture · {status.weightCount} vægt-logs
          </span>
          <span className="text-(--color-text-muted)">
            Gå til Oversigt, Kalender, Historik eller Progression for at se det.
          </span>
        </div>
      )}

      {status.kind === "error" && (
        <p className="text-sm text-(--color-danger)">Der gik noget galt: {status.message}</p>
      )}
    </div>
  );
}
