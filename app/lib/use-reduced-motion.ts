"use client";

import { useSyncExternalStore } from "react";

// False before hydration (matches SSR), then tracks the OS setting.

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