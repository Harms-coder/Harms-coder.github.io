import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

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

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4.5 12.5 9.5 17 19.5 6" />
    </svg>
  );
}
