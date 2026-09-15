import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  title,
  children,
  className,
  tone = "default",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "accent";
}) {
  return (
    <section
      className={cn(
        "rounded-card bg-card border border-hair p-5",
        tone === "accent" && "bg-[var(--bg-card)]",
        className,
      )}
    >
      {title && <h2 className="text-lg font-semibold text-ink mb-3">{title}</h2>}
      {children}
    </section>
  );
}