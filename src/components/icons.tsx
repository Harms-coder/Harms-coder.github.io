import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = ComponentType<IconProps>;

function base(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-5 w-5",
    ...props,
  };
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

/** Fyldt silhuet efter brugerens reference: tyk stang, en høj inderplade og en lavere yderplade i hver ende. */
export function IconDumbbell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <g fill="currentColor" stroke="none">
        <rect x="8" y="10.6" width="8" height="2.8" rx="1.2" />
        <rect x="5" y="7" width="3.2" height="10" rx="1.2" />
        <rect x="15.8" y="7" width="3.2" height="10" rx="1.2" />
        <rect x="2" y="8.8" width="2.4" height="6.4" rx="1" />
        <rect x="19.6" y="8.8" width="2.4" height="6.4" rx="1" />
      </g>
    </svg>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <svg {...base(props)}>
      {/* pathLength=1 lader bundmenuen tegne linjen med stroke-dashoffset uden at kende længden. */}
      <path d="M2.5 12h4l2-7 4 14 3-10 1.5 3h4.5" pathLength={1} />
    </svg>
  );
}

/* Sidste streg (shaft) og pilehoved (head) er hver sin path, så bundmenuen kan forlænge pilen i dens egen retning. */
export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17 9 11l4 4" />
      <path className="shaft" d="M13 15 21 6" />
      <path className="head" d="M15 6h6v6" />
    </svg>
  );
}

/* Hver linje er sin egen gruppe, så bundmenuen kan lade dem hoppe én ad gangen. */
export function IconList(props: IconProps) {
  return (
    <svg {...base(props)}>
      {[6, 12, 18].map((y) => (
        <g key={y}>
          <path d={`M9 ${y}h12`} />
          <circle cx="4" cy={y} r="1.1" fill="currentColor" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

/**
 * Kalender med dagens dato på bladet — til bundmenuen. Bladet (rammens nederste del + tallet) ligger
 * to gange oven på hinanden: det øverste (className="leaf", usynligt i ro) rives af ved tryk, mens det
 * næste med samme dato ligger klar nedenunder.
 */
export function IconCalendarToday(props: IconProps) {
  const day = new Date().getDate();
  const leaf = (
    <>
      <path d="M3.5 10v8.5a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2V10" />
      <text
        x="12"
        y="15.6"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        {day}
      </text>
    </>
  );
  return (
    <svg {...base(props)}>
      <path d="M3.5 10V7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v3M3.5 10h17M8 3v4M16 3v4" />
      <g>{leaf}</g>
      <g className="leaf" opacity={0}>
        {leaf}
      </g>
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 2" />
    </svg>
  );
}

/* Badevægt som speedometer: bue, viser (className="needle", så bundmenuen kan lade den svinge) og fod. */
export function IconScale(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 15.5a7 7 0 0 1 14 0" />
      <path d="M7.2 10.4l-.8-.9M12 8.1V7M16.8 10.4l.8-.9" strokeWidth={1.6} />
      <path className="needle" d="M12 15.5l3.4-4.2" strokeWidth={2.2} />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="M4 19.5h16" strokeWidth={2.4} />
    </svg>
  );
}

/* Tekstlinjerne er hver sin path med pathLength=1, så bundmenuen kan "skrive" dem én ad gangen. */
export function IconClipboard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4.5" width="12" height="16.5" rx="2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <path className="ink" d="M9 12h6" pathLength={1} />
      <path className="ink" d="M9 16h6" pathLength={1} />
    </svg>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20l4.3-.9L18.4 8.9a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2m-8.5 0 .9 12.1a1 1 0 0 0 1 .9h6.2a1 1 0 0 0 1-.9L18.5 7" />
    </svg>
  );
}

export function IconTrophy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 4h8v4.2a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.2H5.3a2.8 2.8 0 0 0 2.8 3.6M16 5.2h2.7a2.8 2.8 0 0 1-2.8 3.6" />
      <path d="M12 12.2v3M9 19.5h6M10 19.5v-1.8h4v1.8" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9.5 12 15l6-5.5" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.3-4.3" />
    </svg>
  );
}

/** Pil ned i en bakke — "gem en kopi ud af appen". */
export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4v10" />
      <path d="M8 10.5l4 4 4-4" />
      <path d="M4 17v1.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V17" />
    </svg>
  );
}

/** Pil op fra en bakke — "læs en fil ind i appen". */
export function IconUpload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 14V4" />
      <path d="M8 7.5l4-4 4 4" />
      <path d="M4 17v1.5A1.5 1.5 0 005.5 20h13a1.5 1.5 0 001.5-1.5V17" />
    </svg>
  );
}

/** Udstyr (stænger, vægtskiver, bænke, håndvægte) tegnes altid i denne farve, adskilt fra selve figuren (currentColor), så man kan se forskel på manden og det han løfter. */
const EQUIPMENT = "var(--color-text)";

export function IconExercisePlaceholder(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 18h13M6 18v3M15 18v3" stroke={EQUIPMENT} />
      <circle cx="6.5" cy="14.5" r="1.6" fill="currentColor" />
      <path d="M8.3 15.1 13 16l2-2.5 2 2.5" />
      <path d="M9 14.5 8.3 8M11.7 15.6 13.3 8" />
      <path d="M5 8h11" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M5 6.5v3M16 6.5v3" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseDips(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3v18M18 3v18" stroke={EQUIPMENT} strokeWidth={2} />
      <circle cx="12" cy="8.5" r="1.6" fill="currentColor" />
      <path d="M9.8 10.5 6 8.5M14.2 10.5 18 8.5" />
      <path d="M12 10.1v4.5" />
      <path d="M12 14.6 10.3 20M12 14.6 14.3 19.5" />
    </svg>
  );
}

export function IconExerciseCurl(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.3" r="1.6" fill="currentColor" />
      <path d="M12 6.9v6.5" />
      <path d="M12 13.4 10 20M12 13.4 14 20" />
      <path d="M12 7.6 14.3 12.3" />
      <path d="M12 7.6 9 9.8 10.4 6.6" />
      <circle cx="10.4" cy="6.6" r="1.5" fill={EQUIPMENT} stroke={EQUIPMENT} />
    </svg>
  );
}

export function IconExerciseSquat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
      <path d="M8.3 6.2h7.4" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M8.3 5.2v2M15.7 5.2v2" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M12 6.6v6.4" />
      <path d="M12 8.5 9.5 10.5M12 8.5 14.5 10.5" />
      <path d="M12 13 9.3 15.5 8.6 20M12 13 14.7 15.5 15.4 20" />
    </svg>
  );
}

export function IconExerciseDeadlift(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="14.5" cy="6" r="1.6" fill="currentColor" />
      <path d="M14 7.4 16.3 13" />
      <path d="M16.3 13 15 20M16.3 13 18 19.5" />
      <path d="M13.6 6.7 9 17" />
      <path d="M7 17h6" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M7 16v2M13 16v2" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseOverheadPress(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="6" r="1.6" fill="currentColor" />
      <path d="M12 7.6v6.4" />
      <path d="M12 14 10.3 20M12 14 13.7 20" />
      <path d="M12 9 8.5 4.5M12 9 15.5 4.5" />
      <path d="M7.5 4h9" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M7.5 3v2M16.5 3v2" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseRow(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7.3" cy="7" r="1.6" fill="currentColor" />
      <path d="M8.1 8.2 13.8 12.3" />
      <path d="M13.8 12.3 12.8 19M13.8 12.3 16.3 18.3" />
      <path d="M7.6 8.5 6.8 12.3" />
      <path d="M6.8 12.3 9.6 11.2" />
      <path d="M6.4 11.9h1.4" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExercisePullup(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4h14" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M5 3v2M19 3v2" stroke={EQUIPMENT} strokeWidth={2.4} />
      <circle cx="12" cy="9" r="1.6" fill="currentColor" />
      <path d="M12 10.6v5.5" />
      <path d="M12 16.1 10.3 20M12 16.1 13.7 20" />
      <path d="M12 10 8 4.5M12 10 16 4.5" />
    </svg>
  );
}

export function IconExerciseLateralRaise(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.3" r="1.6" fill="currentColor" />
      <path d="M12 6.9v7" />
      <path d="M12 13.9 10.3 20M12 13.9 13.7 20" />
      <path d="M12 8.3 5.5 7.3M12 8.3 18.5 7.3" />
      <path d="M4.7 6.6h1.6M17.7 6.6h1.6" stroke={EQUIPMENT} strokeWidth={2.6} />
    </svg>
  );
}

export function IconExerciseLegMachine(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 20v-6h3" stroke={EQUIPMENT} strokeWidth={2} />
      <circle cx="8.5" cy="9.3" r="1.6" fill="currentColor" />
      <path d="M8.5 10.9v4" />
      <path d="M8.5 9.8 6 12" />
      <path d="M8.5 14.9 12 14.9 17 11.5" />
      <path d="M17 11h1.4" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExercisePlank(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="4.8" cy="14.2" r="1.7" fill="currentColor" />
      <path d="M6.4 14.7 19 10.9" />
      <path d="M8.2 15.1 8.5 18.6M12 13.9 12.3 17.2" />
    </svg>
  );
}

export function IconExerciseCrunch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="17.3" cy="12.7" r="1.6" fill="currentColor" />
      <path d="M16 13.8 14 17" />
      <path d="M14 17 11 14.5 8.3 16" />
      <path d="M15.3 14.3 12.5 12.5" />
    </svg>
  );
}

export function IconExerciseHipThrust(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 15h3.5" stroke={EQUIPMENT} strokeWidth={2.4} />
      <circle cx="4.5" cy="13" r="1.6" fill="currentColor" />
      <path d="M5.7 13.6 12 11" />
      <path d="M12 11 15 15 14 19" />
    </svg>
  );
}

export function IconExerciseLunge(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11.5" cy="5.3" r="1.6" fill="currentColor" />
      <path d="M11.5 6.9v6" />
      <path d="M11.5 12.9 9 15 8 20" />
      <path d="M11.5 12.9 15 15.5 17.5 19" />
      <path d="M11.5 8.5 9.5 11M11.5 8.5 13.5 11" />
    </svg>
  );
}

export function IconExerciseShrug(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.6" r="1.6" fill="currentColor" />
      <path d="M12 6.6v6.4" />
      <path d="M12 13 10.3 20M12 13 13.7 20" />
      <path d="M12 7.5 9 8.3M12 7.5 15 8.3" />
      <path d="M9 8.3 8.7 13M15 8.3 15.3 13" />
      <path d="M8 12.6h1.4M14.6 12.6h1.4" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseWristCurl(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="7" cy="8" r="1.6" fill="currentColor" />
      <path d="M7.5 9.4 10 14" />
      <path d="M10 14 9 19M10 14 12 18.5" />
      <path d="M7.7 9.6 12 12.5" />
      <path d="M12 12.5 14.5 13.3" />
      <path d="M14.3 12.6h1.4" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseCarry(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.3" r="1.6" fill="currentColor" />
      <path d="M12 6.9v7" />
      <path d="M12 13.9 9.8 20M12 13.9 14.8 19" />
      <path d="M12 8.3 8.5 13.5M12 8.3 15.5 13.5" />
      <path d="M7.8 13h1.4M14.8 13h1.4" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconExerciseKettlebellSwing(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.6" r="1.6" fill="currentColor" />
      <path d="M12 7.2 13.5 12.5" />
      <path d="M13.5 12.5 12 20M13.5 12.5 16 19" />
      <path d="M12.5 8 9 13" />
      <circle cx="8.3" cy="14" r="1.4" fill={EQUIPMENT} stroke={EQUIPMENT} />
    </svg>
  );
}

export function IconExerciseHangingLegRaise(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 3h14" stroke={EQUIPMENT} strokeWidth={2.4} />
      <path d="M5 2v2M19 2v2" stroke={EQUIPMENT} strokeWidth={2.4} />
      <circle cx="12" cy="8" r="1.6" fill="currentColor" />
      <path d="M12 9.6v5" />
      <path d="M12 9.3 8.5 4M12 9.3 15.5 4" />
      <path d="M12 14.6 15 10.5M12 14.6 17 12" />
    </svg>
  );
}

export function IconExerciseTricepsExtension(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5.3" r="1.6" fill="currentColor" />
      <path d="M12 6.9v7" />
      <path d="M12 13.9 10.3 20M12 13.9 13.7 20" />
      <path d="M12 8 12 4.5" />
      <path d="M12 4.5 15 7" />
      <path d="M14.3 6.4h1.6" stroke={EQUIPMENT} strokeWidth={2.4} />
    </svg>
  );
}

export function IconMore(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="19" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Løbe-piktogram: slanke lemmer med skarpe knæ og albuer, afrundede ender, løsrevet
 * hoved og tilspidsede fartstriber. Tegnet efter en reference brugeren valgte.
 * Farven kommer fra currentColor, så den følger den kategori den vises i.
 */
/** Løberen er SPORET direkte fra brugerens reference-billede (cv2-kontur → path), ikke tegnet i hånden. */
export function IconRun(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M8.62 14.08 L8.43 13.71 L7.97 13.71 L7.88 13.81 L0 13.99 L7.23 14.18 L7.32 14.27 L8.43 14.27Z M10.1 11.86 L10.01 11.4 L1.3 11.68Z M12.05 9.73 L12.05 9.54 L11.86 9.36 L3.06 9.64 L8.53 9.73 L8.62 9.82 L11.21 9.82 L11.31 9.92 L11.86 9.92Z M23.81 11.12 L23.35 10.75 L20.2 10.84 L20.02 10.66 L19.55 8.9 L19.09 8.8 L19.09 8.06 L18.81 7.41 L15.2 3.52 L14.64 3.24 L14.08 3.34 L11.31 5.37 L10.75 6.02 L10.75 6.67 L11.12 7.14 L11.86 7.23 L13.99 5.65 L14.55 5.56 L16.22 7.32 L16.22 7.88 L12.97 12.23 L12.79 12.6 L12.79 13.44 L12.32 13.53 L12.23 13.16 L9.27 16.12 L5.19 19.55 L5 20.02 L5.19 20.66 L5.84 21.03 L6.49 20.85 L10.01 17.79 L10.56 17.42 L13.16 14.83 L13.25 14.36 L13.81 14.36 L15.94 15.29 L15.94 15.75 L13.9 16.86 L13.71 16.86 L13.34 17.24 L13.25 18.07 L13.53 18.44 L13.9 18.63 L14.36 18.63 L14.55 18.44 L14.73 18.44 L15.47 17.98 L15.66 17.98 L16.4 17.51 L16.59 17.51 L17.14 17.14 L17.33 17.14 L18.07 16.68 L19.18 16.22 L19.55 15.85 L19.55 15.1 L19.37 14.73 L18.44 14.27 L16.4 13.53 L16.03 13.25 L16.03 12.88 L17.79 10.56 L18.25 10.66 L18.53 12.05 L18.9 12.51 L19.27 12.69 L23.35 12.51 L23.91 12.05 L24 11.49Z M19.64 2.97 L19.09 3.15 L18.44 3.71 L18.16 4.26 L18.07 5.19 L18.35 5.93 L18.72 6.39 L19.64 6.86 L20.39 6.86 L20.94 6.67 L21.68 6.02 L21.96 5.37 L21.96 4.36 L21.68 3.8 L21.13 3.24 L20.48 2.97Z" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21S5.5 13.86 5.5 9.5a6.5 6.5 0 0 1 13 0C18.5 13.86 12 21 12 21Z" />
      <circle cx="12" cy="9.3" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5 9.5 17 19.5 6" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3c1 2.5-2.5 3.8-2.5 6.8a2.5 2.5 0 0 0 5 0c1.3 1 2 2.5 2 4a4.5 4.5 0 0 1-9 0C7.5 10 9 6.5 12 3Z" />
    </svg>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14.5 6 8 12l6.5 6" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 6 16 12l-6.5 6" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4.5v15l13-7.5-13-7.5Z" />
    </svg>
  );
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Kalender med streg over — "ikke planlagt". */
export function IconCalendarOff(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M4.5 20.5 19.5 5" strokeWidth={2} />
    </svg>
  );
}

/** Sendes fill="currentColor" for udfyldt (favorit) — ellers står den som kontur. */
export function IconStar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.6l2.6 5.28 5.83.85-4.22 4.11.996 5.8L12 16.9l-5.21 2.74.996-5.8-4.22-4.11 5.83-.85Z" />
    </svg>
  );
}

export function IconLightbulb(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1v.5h5v-.5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3.5Z" />
      <path d="M9.5 19.5h5M10.3 22h3.4" />
    </svg>
  );
}
