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

export function IconDumbbell(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="9" width="3" height="6" rx="1" />
      <rect x="17.5" y="9" width="3" height="6" rx="1" />
      <path d="M6.5 12h11" strokeWidth={2.2} />
    </svg>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12h4l2-7 4 14 3-10 1.5 3h4.5" />
    </svg>
  );
}

export function IconTrendUp(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 6h12M9 12h12M9 18h12" />
      <circle cx="4" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.1" fill="currentColor" stroke="none" />
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

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.2 2" />
    </svg>
  );
}

export function IconScale(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <circle cx="12" cy="12.5" r="3.6" />
      <path d="M12 12.5 14.2 10.2" />
    </svg>
  );
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6" y="4.5" width="12" height="16.5" rx="2" />
      <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
      <path d="M9 12h6M9 16h6" />
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

export function IconRun(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <circle cx="15.8" cy="4.3" r="2.1" />
      <path d="M14.3 6.2 11.2 12.2 15.5 10.3 12.8 7.2Z" />
      <path d="M15.5 10.3 13.8 15.8 12.4 15.2 14.5 10Z" />
      <path d="M11.9 10.8 5.2 17.9 4 17 10.6 10.3Z" />
      <path d="M14.6 6 18.5 9.5 17.4 10.7 13.6 6.9Z" />
      <path d="M13 6.3 9.3 9 11.3 11.8 13.9 7.1Z" />
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

/*
 * Silhuetter til vægt-sammenligningen ("Det svarer til ca. 5 pickup trucks").
 * Bevidst grove stregtegninger — de skal antyde skalaen, ikke være arts-korrekte.
 */
export function IconSilhouettePerson(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="5" r="2.2" fill="currentColor" />
      <path d="M12 7.6v6.2" strokeWidth={2.6} />
      <path d="M12 9.2 8.6 11M12 9.2l3.4 1.8" strokeWidth={2.2} />
      <path d="M12 13.8 9.6 20M12 13.8 14.4 20" strokeWidth={2.6} />
    </svg>
  );
}

export function IconSilhouetteAnimal(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 13.5v-2.2c0-1.5 1.2-2.6 2.7-2.6h6.6l2.4-2.6h1.8l-.9 2.9 2.4 1.4v3.1h-2" strokeWidth={2} />
      <path d="M5.6 13.6 5.2 18M9.2 13.6 8.9 18M14.4 13.6 14.1 18M17.9 13.6 17.6 18" strokeWidth={2} />
      <circle cx="18.6" cy="7.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSilhouetteWhale(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 14.4c2.6-4.4 7-6.6 11.4-6.2 2.6.2 4.6 1.4 6.1 3.3-1.7 3.6-5.2 5.6-9.6 5.6-3.2 0-5.9-.9-7.9-2.7Z" strokeWidth={1.8} />
      <path d="M20.5 11.5 22.4 8l-1.2 4.5" strokeWidth={1.8} />
      <circle cx="7.4" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSilhouetteCar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 15.4v-2.6l2.2-.5 2.5-3.4h6l3 3.4 4.3.9v2.2" strokeWidth={2} />
      <path d="M3 15.4h3M10 15.4h5M19.5 15.4H21" strokeWidth={2} />
      <circle cx="8" cy="16.4" r="1.8" strokeWidth={1.8} />
      <circle cx="17.4" cy="16.4" r="1.8" strokeWidth={1.8} />
    </svg>
  );
}

export function IconSilhouetteTruck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.6 15.6V7.2h11.2v8.4" strokeWidth={2} />
      <path d="M13.8 10h3.6l3.6 3.4v2.2" strokeWidth={2} />
      <path d="M2.6 15.6h1.6M8.8 15.6h4.4M18.6 15.6H21" strokeWidth={2} />
      <circle cx="6.4" cy="16.6" r="1.8" strokeWidth={1.8} />
      <circle cx="16.4" cy="16.6" r="1.8" strokeWidth={1.8} />
    </svg>
  );
}

export function IconSilhouettePlane(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.6 13.2 21 9.8c1 -.2 1.4 1.2.5 1.7l-4.2 2.2-3.4 5.2h-2l1.4-4.2-4 .9-1.6 2.2H6l.6-2.6-4-1.2c-.8-.3-.8-1.4 0-1.6Z" strokeWidth={1.8} />
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
