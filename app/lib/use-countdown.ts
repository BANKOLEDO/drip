"use client";

import { useSyncExternalStore } from "react";

/** Server-safe: returns null before hydration so SSR/static output matches.
 * Client: re-renders each interval with the guard state at "now".
 *
 * The snapshot is quantized to whole intervalMs buckets on purpose:
 * useSyncExternalStore forces a re-render whenever getSnapshot() changes, so a
 * raw Date.now() (new value every ms) can spin past the update-depth cap while
 * the passive-mount commit runs. Bucketing keeps the value stable inside each
 * window, which also makes hydration deterministic. */
export function useCountdown(intervalMs = 1000) {
  const now = useSyncExternalStore(
    (subscribe) => {
      const id = setInterval(subscribe, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );

  return now > 0 ? now : null;
}