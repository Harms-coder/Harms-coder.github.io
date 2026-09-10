import { useEffect, useRef, useState } from "react";
import { IconClock, IconX } from "../../components/icons";

const PRESETS_SEC = [60, 120, 180];

interface RestTimerProps {
  /** Skift værdi (fx tæller op) for at auto-starte hvile med sidst brugte varighed. */
  autoStartSignal: number;
}

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RestTimer({ autoStartSignal }: RestTimerProps) {
  const [lastPreset, setLastPreset] = useState(120);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [justFinished, setJustFinished] = useState(false);
  const lastHandledSignal = useRef(autoStartSignal);

  function start(seconds: number) {
    setLastPreset(seconds);
    setEndTime(Date.now() + seconds * 1000);
    setJustFinished(false);
  }

  function stop() {
    setEndTime(null);
  }

  useEffect(() => {
    if (autoStartSignal === lastHandledSignal.current) return;
    lastHandledSignal.current = autoStartSignal;
    start(lastPreset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  useEffect(() => {
    if (endTime === null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endTime]);

  const remainingSec = endTime !== null ? Math.max(0, Math.ceil((endTime - now) / 1000)) : null;

  useEffect(() => {
    if (remainingSec === 0) {
      setEndTime(null);
      setJustFinished(true);
      const timeout = setTimeout(() => setJustFinished(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [remainingSec]);

  const isRunning = remainingSec !== null && remainingSec > 0;

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
      <span className="flex items-center gap-1.5 text-[13px] font-medium text-(--color-text-muted)">
        <IconClock className="h-4 w-4" />
        Hviletimer
      </span>

      {isRunning ? (
        <div className="flex items-center justify-between">
          <span className="text-[32px] font-bold tabular-nums text-(--color-cat-strength)">
            {formatRemaining(remainingSec)}
          </span>
          <button
            type="button"
            onClick={stop}
            aria-label="Spring hvile over"
            className="flex items-center gap-1.5 rounded-full glass-fill px-3.5 py-2 text-[13px] font-medium text-(--color-text) active:opacity-70"
          >
            <IconX className="h-4 w-4" />
            Spring over
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {PRESETS_SEC.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => start(sec)}
              className="min-h-11 flex-1 rounded-xl glass-fill text-[15px] font-medium text-(--color-text) active:opacity-70"
            >
              {sec / 60} min
            </button>
          ))}
        </div>
      )}

      {justFinished && (
        <span className="text-[13px] font-semibold text-(--color-success)">
          Hvile færdig — klar til næste sæt
        </span>
      )}
    </div>
  );
}
