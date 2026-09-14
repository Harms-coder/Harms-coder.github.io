import type { Exercise } from "../../types";
import { arePaired, togglePair } from "./supersets";

interface SupersetEditorProps {
  exercises: Exercise[];
  /** Øvelserne i programmet, i den rækkefølge de er valgt. */
  selectedIds: string[];
  supersets: string[][];
  onChange: (supersets: string[][]) => void;
}

/**
 * Kæden mellem to øvelser i træk: tryk for at køre dem som supersæt. Kun naboer kan parres,
 * så listen kan læses ovenfra og ned — og en øvelse kan kun stå i ét par.
 */
export function SupersetEditor({ exercises, selectedIds, supersets, onChange }: SupersetEditorProps) {
  if (selectedIds.length < 2) return null;
  const nameById = new Map(exercises.map((e) => [e.id, e.name]));

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-(--color-text-muted)">
        Supersæt (valgfrit)
      </span>
      <div className="flex flex-col rounded-xl border border-(--color-border) bg-(--color-surface-2) p-2">
        {selectedIds.map((id, i) => {
          const next = selectedIds[i + 1];
          const paired = next !== undefined && arePaired(supersets, id, next);
          return (
            <div key={id} className="flex flex-col">
              <span className="px-1 py-1 text-[13.5px] text-(--color-text)">
                {nameById.get(id) ?? "Ukendt øvelse"}
              </span>
              {next !== undefined && (
                <button
                  type="button"
                  onClick={() => onChange(togglePair(supersets, id, next))}
                  className={`self-start rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
                    paired
                      ? "accent-fill text-(--color-text-on-accent)"
                      : "glass-fill text-(--color-text-muted)"
                  }`}
                >
                  {paired ? "Supersæt" : "+ Supersæt"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
