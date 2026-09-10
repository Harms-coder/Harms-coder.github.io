import { useId } from "react";

interface GoalProgressProps {
  label: string;
  statusText: string;
  percent: number;
  variant?: "bar" | "circular";
  /** Ringens diameter i px (kun "circular"). */
  size?: number;
}

const CIRCLE_RADIUS = 26;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export function GoalProgress({
  label,
  statusText,
  percent,
  variant = "bar",
  size = 64,
}: GoalProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const gradientId = useId();
  const glowFilterId = `${gradientId}-glow`;

  if (variant === "circular") {
    const offset = CIRCLE_CIRCUMFERENCE - (clamped / 100) * CIRCLE_CIRCUMFERENCE;
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 64 64" className="-rotate-90" style={{ width: size, height: size }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-glow)" />
                <stop offset="48%" stopColor="var(--color-accent-bright)" />
                <stop offset="100%" stopColor="var(--color-accent-dark)" />
              </linearGradient>
              {/* Samme dobbelt-lags blur+glød-teknik som VigorraLogo, så ringen føles lige så "illuminated" som .accent-fill. */}
              <filter id={glowFilterId} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="32"
              cy="32"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="var(--color-surface-2)"
              strokeWidth="6"
            />
            <circle
              cx="32"
              cy="32"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={offset}
              filter={`url(#${glowFilterId})`}
            />
            {/* Glasagtig lys-stribe henover buen, samme idé som den hvide top-highlight i .accent-fill. */}
            <circle
              cx="32"
              cy="32"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <span
            className="absolute font-semibold text-(--color-text)"
            style={{ fontSize: Math.round(size * 0.19) }}
          >
            {Math.round(clamped)}%
          </span>
        </div>
        {statusText && (
          <span className="text-center text-[12px] text-(--color-text-muted)">{statusText}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-(--color-text)">{label}</span>
        <span className="whitespace-nowrap text-[12px] font-medium text-(--color-text-muted)">
          {statusText}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-(--color-surface-2)">
        <div className="accent-fill h-full rounded-full" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
