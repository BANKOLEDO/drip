import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      className={cn("animate-pulse rounded-control bg-[var(--hairline)]", className)}
    />
  );
}