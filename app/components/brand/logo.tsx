import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Brand mark matching the generated logo: three ascending rounded bars,
 * tallest has a droplet cutout. Drawn inline (crisp at any size).
 */
export function LogoMark({ className }: { className?: string }) {
  const holeId = useId();

  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={cn("h-7 w-7", className)}>
      <rect x="5" y="23" width="10" height="20" rx="5" fill="var(--leaf)" />
      <rect x="19" y="14" width="10" height="29" rx="5" fill="var(--leaf)" />
      <mask id={holeId}>
        <rect width="48" height="48" fill="white" />
        <path
          d="M33.5 9 C 38 14.5, 39 19, 33.5 25.5 C 28 19, 29 14.5, 33.5 9 Z"
          fill="black"
        />
      </mask>
      <rect
        x="33"
        y="6"
        width="10"
        height="37"
        rx="5"
        fill="var(--leaf)"
        mask={`url(#${holeId})`}
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">Drip</span>
    </span>
  );
}