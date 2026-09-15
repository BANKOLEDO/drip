"use client";

import { useCountdown } from "@/lib/use-countdown";
import { guardStateAt, formatCountdown } from "@/lib/format";
import { cn } from "@/lib/cn";

// Watch the live 00:30 UTC pause window. This is the product's heartbeat.
export function NextGuardWindow({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const nowMs = useCountdown();
  // Atomic placeholder until a real client timestamp exists (server + hydrate
  // tick render identically); after hydration the live countdown swaps in.
  const state = nowMs ? guardStateAt(new Date(nowMs)) : null;

  const paused = state?.paused ?? false;
  const label = paused ? "Guard active" : "Next guard window";
  const time = state
    ? paused
      ? formatCountdown(state.inPauseMs)
      : formatCountdown(state.untilPauseStartMs)
    : "--:--:--";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs tabular",
        paused
          ? "border-amber/40 bg-amber/10 text-amber"
          : variant === "dark"
            ? "border-white/15 bg-white/5 text-night-muted"
            : "border-hair bg-card text-sub",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          paused ? "animate-pulse bg-amber" : "bg-money",
        )}
      />
      <span>{label}</span>
      <span
        className={cn(
          "tabular",
          paused ? "text-amber" : variant === "dark" ? "text-paper" : "text-ink",
        )}
      >
        {time}
      </span>
    </div>
  );
}