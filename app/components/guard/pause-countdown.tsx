"use client";

import { useCountdown } from "@/lib/use-countdown";
import { guardStateAt, formatCountdown } from "@/lib/format";

// One plain line: when the next dividend pause window starts. Same output
// on server and first hydrate tick, live countdown after.
export function PauseCountdown() {
  const nowMs = useCountdown();
  if (!nowMs) {
    return <span>Dividend pause window: —</span>;
  }
  const state = guardStateAt(new Date(nowMs));
  if (state.paused) return <span>Dividend pause window: open now</span>;
  return <span>Dividend pause window: in {formatCountdown(state.untilPauseStartMs)}</span>;
}
