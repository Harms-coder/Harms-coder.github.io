import { useId } from "react";

interface AxisTrendChartProps {
  values: number[];
  /** x-akse-label pr. punkt; "" springes visuelt over (bruges til at undgå gentagne labels). */
  labels: string[];
  /** Valgfri stiplet fremskrivning videre til et fremtidigt mål-punkt, fx forventet måldato. */
  projection?: { value: number; label: string };
  /** Y-aksen starter altid ved 0 (fx km-mål). Udelades for værdier hvor 0 er urealistisk, fx kropsvægt. */
  includeZero?: boolean;
  height?: number;
  /** Kategorifarve på linje, punkter og fladefyld. Default: accent. */
  color?: string;
}

const WIDTH = 280;
const PAD_LEFT = 26;
const PAD_TOP = 8;
const PAD_BOTTOM = 16;
const TICK_COUNT = 3;

function niceTicks(min: number, max: number): number[] {
  if (min === max) return [min - 1, min, min + 1];
  const step = (max - min) / (TICK_COUNT - 1);
  return Array.from({ length: TICK_COUNT }, (_, i) => Math.round((min + i * step) * 10) / 10);
}

/** Kompakt akse-mærket trendgraf (y-akse-tal + x-akse-labels), til Mål-siden — enklere stil end den delte Sparkline. */
export function AxisTrendChart({
  values,
  labels,
  projection,
  includeZero = false,
  height = 60,
  color = "var(--color-cat-progress)",
}: AxisTrendChartProps) {
  // Eget id pr. graf — ellers deler to grafer på samme side den samme gradient-definition.
  const fillId = useId();
  if (values.length < 2) return null;

  const allValues = projection ? [...values, projection.value] : values;
  const min = includeZero ? Math.min(...allValues, 0) : Math.min(...allValues);
  const max = Math.max(...allValues);
  const ticks = niceTicks(min, max === min ? min + 1 : max);
  const range = ticks[ticks.length - 1] - ticks[0] || 1;

  const plotWidth = WIDTH - PAD_LEFT;
  const slots = values.length + (projection ? 1 : 0);
  const stepX = plotWidth / (slots - 1);
  const totalHeight = PAD_TOP + height + PAD_BOTTOM;

  const toX = (index: number) => PAD_LEFT + index * stepX;
  const toY = (value: number) => height - ((value - ticks[0]) / range) * height;

  const points = values.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const areaPath = `M${toX(0)},${height} L${points.split(" ").join(" L")} L${toX(values.length - 1)},${height} Z`;
  const allLabels = projection ? [...labels, projection.label] : labels;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${totalHeight}`} width="100%" height={totalHeight}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      <g transform={`translate(0, ${PAD_TOP})`}>
        {ticks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              y1={toY(tick)}
              x2={WIDTH}
              y2={toY(tick)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={PAD_LEFT - 5}
              y={toY(tick) + 3}
              fontSize={9.5}
              fill="var(--color-text-muted)"
              textAnchor="end"
            >
              {tick}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={`url(#${fillId})`} stroke="none" />
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r={2.4} fill={color} />
        ))}

        {projection && (
          <>
            <line
              x1={toX(values.length - 1)}
              y1={toY(values[values.length - 1])}
              x2={toX(values.length)}
              y2={toY(projection.value)}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="3 4"
            />
            <circle
              cx={toX(values.length)}
              cy={toY(projection.value)}
              r={3.5}
              fill="var(--color-surface)"
              stroke={color}
              strokeWidth={2}
            />
          </>
        )}

        {allLabels.map(
          (label, i) =>
            label && (
              <text
                key={i}
                x={toX(i)}
                y={height + 12}
                fontSize={9.5}
                fill="var(--color-text-muted)"
                textAnchor={i === 0 ? "start" : i === slots - 1 ? "end" : "middle"}
              >
                {label}
              </text>
            ),
        )}
      </g>
    </svg>
  );
}
