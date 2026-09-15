"use client";

import { useSyncExternalStore } from "react";

// Server-safe: returns false before hydration so SSR/static output matches the
// first client render, then re-renders once if the OS prefers reduced motion.
// Same bucketing discipline as use-countdown: the snapshot only changes when
// the preference actually flips.

const query = () => "(prefers-reduced-motion: reduce)";

export function useReducedMotion() {
  return useSyncExternalStore(
    (subscribe) => {
      const mq = window.matchMedia(query());
      mq.addEventListener("change", subscribe);
      return () => mq.removeEventListener("change", subscribe);
    },
    () => window.matchMedia(query()).matches,
    () => false,
  );
}