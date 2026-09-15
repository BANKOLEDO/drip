import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  color = "money",
  className,
}: {
  children: ReactNode;
  color?: "money" | "amber" | "danger" | "sub";
  className?: string;
}) {
  const colors = {
    money: "bg-money text-white",
    amber: "bg-amber text-white",
    danger: "bg-danger text-white",
    sub: "bg-sub text-white",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-semibold",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}