import { useEffect, useRef, useState } from "react";
import { IconBell, IconClock, IconX } from "../../components/icons";
import {
  notificationPermission,
  notifyRestDone,
  requestNotificationPermission,
} from "../../lib/restNotification";

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

/**
 * Kort bip via WebAudio frem for en lydfil — ingen asset at hente, og ingen forsinkelse
 * første gang. AudioContext oprettes ved tryk på timeren, fordi browsere kun tillader lyd
 * efter en brugerhandling; oprettes den først når timeren rammer nul, er den blokeret.
 */
function playBeep(ctx: AudioContext) {
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  for (const [index, startOffset] of [0, 0.28].entries()) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = index === 0 ? 880 : 1180;
    osc.connect(gain);
    const t = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.24);
  }
}

export function RestTimer({ autoStartSignal }: RestTimerProps) {
  const [lastPreset, setLastPreset] = useState(120);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [justFinished, setJustFinished] = useState(false);
  const lastHandledSignal = useRef(autoStartSignal);
  const audioRef = useRef<AudioContext | null>(null);
  const [permission, setPermission] = useState(notificationPermission);
  /* Så beskeden kun sendes én gang pr. hvile, selv hvis siden vågner flere gange. */
  const notifiedFor = useRef<number | null>(null);

  function start(seconds: number) {
    // Oprettes/genoptages her, mens vi stadig er inde i brugerens tryk.
    try {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
    } catch {
      audioRef.current = null;
    }
    setLastPreset(seconds);
    setEndTime(Date.now() + seconds * 1000);
    setJustFinished(false);
    notifiedFor.current = null;
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
    /*
     * iOS fryser siden, mens skærmen er låst, så intervallet står stille. Når telefonen vågner,
     * læses uret igen med det samme — ellers ville timeren se ud til at hænge på fx 0:37.
     */
    const onWake = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onWake);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onWake);
    };
  }, [endTime]);

  const remainingSec = endTime !== null ? Math.max(0, Math.ceil((endTime - now) / 1000)) : null;

  useEffect(() => {
    if (remainingSec === 0) {
      setEndTime(null);
      setJustFinished(true);
      if (audioRef.current) {
        try {
          playBeep(audioRef.current);
        } catch {
          // Lyd er en bekvemmelighed — en blokeret AudioContext må ikke vælte timeren.
        }
      }
      // Virker ikke på iOS, men koster intet at forsøge der hvor det gør.
      navigator.vibrate?.([180, 90, 180]);
      if (endTime !== null && notifiedFor.current !== endTime) {
        notifiedFor.current = endTime;
        void notifyRestDone();
      }
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

      {permission === "default" && (
        /* Vises kun indtil der er svaret — iOS kræver et tryk for overhovedet at måtte spørge. */
        <button
          type="button"
          onClick={() => void requestNotificationPermission().then(setPermission)}
          className="flex min-h-9 items-center justify-center gap-1.5 self-start rounded-full glass-fill px-3 text-[12.5px] font-medium text-(--color-text-secondary) active:opacity-70"
        >
          <IconBell className="h-3.5 w-3.5" />
          Giv besked når hvilen er slut
        </button>
      )}

      {justFinished && (
        <span className="text-[13px] font-semibold text-(--color-success)">
          Hvile færdig — klar til næste sæt
        </span>
      )}
    </div>
  );
}
