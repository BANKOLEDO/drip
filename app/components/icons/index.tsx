import type { SVGProps } from "react";

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

type P = SVGProps<SVGSVGElement>;

export function IconShield(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6l7-3z" />
      <path d="M9.5 12l1.8 1.8 3.6-3.8" />
    </svg>
  );
}

export function IconDrop(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M12 3c2 4 6 7.4 6 11.2A6 6 0 1 1 6 14.2C6 10.4 10 7 12 3z" />
      <path d="M12 10v5" />
    </svg>
  );
}

export function IconCalendar(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
      <path d="M8.2 14.5h.01M12 14.5h.01M15.8 14.5h.01" />
    </svg>
  );
}

export function IconPause(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="6.5" y="4.5" width="3.5" height="15" rx="1" />
      <rect x="14" y="4.5" width="3.5" height="15" rx="1" />
    </svg>
  );
}

export function IconChart(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M4 4v16h16" />
      <path d="M8 15l4-4 3 3 5-6" />
    </svg>
  );
}

export function IconWallet(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M16.5 12h.01" />
    </svg>
  );
}

export function IconMoon(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <path d="M20 13.2A8 8 0 0 1 10.8 4 8 8 0 1 0 20 13.2z" />
    </svg>
  );
}

export function IconLock(props: P) {
  return (
    <svg {...base} {...props} aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}