import { useState } from "react";
import { Button } from "../../components/Button";
import type { SetType } from "../../types";

const WEIGHT_DELTAS_DOWN = [-5, -2.5];
const WEIGHT_DELTAS_UP = [2.5, 5];
const REP_PRESETS = [6, 8, 10, 12, 15];

const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: "Normal",
  warmup: "Varm op",
  dropset: "Drop sæt",
  "1rm": "1RM",
};

interface SetInputFormProps {
  initialWeight?: number;
  initialReps?: number;
  onSave: (values: { weight: number; reps: number; setType: SetType }) => void;
}

export function SetInputForm({ initialWeight, initialReps, onSave }: SetInputFormProps) {
  const [weight, setWeight] = useState(initialWeight?.toString() ?? "");
  const [reps, setReps] = useState(initialReps?.toString() ?? "");
  const [setType, setSetType] = useState<SetType>("normal");

  function adjustWeight(delta: number) {
    const current = Number(weight) || 0;
    const next = Math.max(0, Math.round((current + delta) * 100) / 100);
    setWeight(next.toString());
  }

  function handleSave() {
    const weightValue = Number(weight);
    const repsValue = Number(reps);
    if (Number.isNaN(weightValue) || weight.trim() === "") return;
    if (!repsValue) return;
    onSave({ weight: weightValue, reps: repsValue, setType });
  }

  return (
    <div className="flex flex-col gap-3 border-t border-(--color-border) pt-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SET_TYPE_LABELS) as SetType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSetType(type)}
            className={`min-h-9 rounded-full px-3 text-[13px] font-medium ${
              setType === type
                ? "accent-fill text-(--color-text)"
                : "glass-fill text-(--color-text-muted)"
            }`}
          >
            {SET_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-(--color-text-muted)">Vægt (kg)</span>
        <div className="flex items-center gap-2">
          {WEIGHT_DELTAS_DOWN.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => adjustWeight(delta)}
              className="min-h-11 min-w-11 flex-shrink-0 rounded-xl glass-fill text-[15px] font-medium text-(--color-text) active:opacity-70"
            >
              {delta}
            </button>
          ))}
          <input
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-center text-[17px] font-semibold text-(--color-text) outline-none focus:border-(--color-cat-strength)"
          />
          {WEIGHT_DELTAS_UP.map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => adjustWeight(delta)}
              className="min-h-11 min-w-11 flex-shrink-0 rounded-xl glass-fill text-[15px] font-medium text-(--color-text) active:opacity-70"
            >
              +{delta}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-(--color-text-muted)">Reps</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="min-h-11 w-16 rounded-xl border border-(--color-border) bg-(--color-surface) px-2 text-center text-[17px] font-semibold text-(--color-text) outline-none focus:border-(--color-cat-strength)"
          />
          <div className="flex flex-1 flex-wrap gap-2">
            {REP_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReps(preset.toString())}
                className={`min-h-9 min-w-9 rounded-full px-2 text-[13px] font-medium ${
                  reps === preset.toString()
                    ? "accent-fill text-(--color-text)"
                    : "glass-fill text-(--color-text-muted)"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSave}>Gem sæt</Button>
    </div>
  );
}
