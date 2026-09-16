"use client";

import { guardStateAt, formatCountdown } from "@/lib/format";
import { useCountdown } from "@/lib/use-countdown";
import { IconLock, IconShield } from "@/components/icons";
import { Pill } from "@/components/ui/pill";
import { PAUSE_WINDOW_MINUTES } from "@/lib/tokens";

export type GuardMode = "idle" | "paused" | "premium";

/**
 * The signature status element: lives on the buy button and plan cards.
 * - idle: countdown to the next 00:30 UTC pause window
 * - paused: amber, "Protecting your buy. Dividend cut imminent."
 * - premium: "Price spike detected. Buy deferred."
 */
export function GuardPill({
  mode = "idle",
  className,
}: {
  mode?: GuardMode;
  className?: string;
}) {
  const nowMs = useCountdown();
  // No real timestamp yet (server + first hydrate tick): render atomically,
  // same on both, so hydration can't mismatch on a 1-second boundary.
  const state = nowMs ? guardStateAt(new Date(nowMs)) : null;

  const tone =
    mode === "paused" || mode === "premium" || state?.paused
      ? "amber"
      : "green";
  const icon =
    mode === "paused" || mode === "premium" || state?.paused ? (
      <IconLock />
    ) : (
      <IconShield />
    );

  const text =
    mode === "paused"
      ? "Protecting your buy. Dividend cut imminent"
      : mode === "premium"
        ? "Price spike detected. Buy deferred"
        : state?.paused
          ? "Buys paused. Dividend flip in progress"
          : "Guard on";

  return (
    <Pill tone={tone} className={className}>
      <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      <span className="tabular">{text}</span>
      {state?.guarding && (
        <span
          className="ml-0.5 font-mono tabular"
          aria-label="time until pause window"
        >
          · {formatCountdown(state.untilPauseStartMs)}
        </span>
      )}
    </Pill>
  );
}

export { PAUSE_WINDOW_MINUTES };