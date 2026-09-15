import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  default: "bg-paper text-sub border-hair",
  green: "bg-money/10 text-money-deep border-money/20",
  amber: "bg-amber/10 text-amber border-amber/25",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-info/10 text-info border-info/25",
} as const;

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}