import { cn } from "@/lib/cn";

type WaveProps = {
  // Tailwind color class of the section ABOVE, painted over the section below
  fill: string;
  className?: string;
};

// Painter's tape at the top of a banded section. Fill should match the
// previous token so the edge reads as that color curving into this one.
export function Wave({ fill, className }: WaveProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 -top-10 h-10 sm:-top-14 sm:h-14",
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 56"
        preserveAspectRatio="none"
        className={cn("h-full w-full", fill)}
      >
        <path
          d="M0 0 C 180 56, 360 56, 540 30 C 720 6, 900 14, 1080 30 C 1260 46, 1380 40, 1440 22 L 1440 56 L 0 56 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}