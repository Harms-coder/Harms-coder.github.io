const MAX_LABELS_SHOWN = 7;

interface SparklineProps {
  values: number[];
  labels?: string[];
  height?: number;
  color?: string;
  unit?: string;
}

/** Vælger op til MAX_LABELS_SHOWN indeks, altid inkl. første/sidste, jævnt fordelt. */
function pickLabelIndexes(count: number): Set<number> {
  if (count <= MAX_LABELS_SHOWN) return new Set(Array.from({ length: count }, (_, i) => i));
  const step = (count - 1) / (MAX_LABELS_SHOWN - 1);
  return new Set(Array.from({ length: MAX_LABELS_SHOWN }, (_, i) => Math.round(i * step)));
}

/** Kompakt trend-graf med udfyldt areal, gennemsnitslinje, punkter pr. dag og start/slut-værdier i hjørnerne. */
export function Sparkline({
  values,
  labels,
  height = 64,
  color = "var(--color-cat-progress)",
  unit = "",
}: SparklineProps) {
  if (values.length < 2) return null;

  const width = 300;
  const padTop = 16;
  const padBottom = labels ? 16 : 0;
  const min = Math.min(...values);
  const max = Math.min(...values) === Math.max(...values) ? min + 1 : Math.max(...values);
  const range = max - min;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const stepX = width / (values.length - 1);
  const chartBottom = padTop + height;
  const totalHeight = chartBottom + padBottom;

  const toY = (value: number) => padTop + height - ((value - min) / range) * height;

  const points = values.map((value, index) => `${index * stepX},${toY(value)}`).join(" ");
  const areaPath = `M0,${chartBottom} L${points.split(" ").join(" L")} L${width},${chartBottom} Z`;
  const avgY = toY(avg);
  const shownLabelIndexes = labels ? pickLabelIndexes(labels.length) : undefined;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      width="100%"
      height={totalHeight}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        <filter id="sparklineGlow" x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text x={0} y={10} fontSize={10} fill="var(--color-text-muted)" textAnchor="start">
        {values[0]}{unit}
      </text>
      <text x={width} y={10} fontSize={10} fill="var(--color-text)" fontWeight={600} textAnchor="end">
        {values[values.length - 1]}{unit}
      </text>
      <line
        x1={0}
        y1={avgY}
        x2={width}
        y2={avgY}
        stroke="var(--color-text-muted)"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
      <path d={areaPath} fill="url(#sparklineFill)" stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sparklineGlow)"
      />
      {values.map((value, index) => (
        <circle
          key={index}
          cx={index * stepX}
          cy={toY(value)}
          r={index === values.length - 1 ? 3.5 : 2.2}
          fill={color}
        />
      ))}
      {labels?.map(
        (label, index) =>
          shownLabelIndexes?.has(index) && (
            <text
              key={index}
              x={index * stepX}
              y={chartBottom + 13}
              fontSize={9.5}
              fill="var(--color-text-muted)"
              textAnchor={index === 0 ? "start" : index === labels.length - 1 ? "end" : "middle"}
            >
              {label}
            </text>
          ),
      )}
    </svg>
  );
}
