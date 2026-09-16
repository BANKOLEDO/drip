"use client";

// Demo vs Live data mode. Demo serves curated instant numbers; live hits
// real feeds with labeled fallback. Module flag so plain functions can
// read it without React context.

import { MODE_COOKIE, DEFAULT_MODE, type DataMode } from "./mode-keys";

export type { DataMode };
export { MODE_COOKIE, DEFAULT_MODE };

let current: DataMode = "demo";

function readCookie(): DataMode | null {
  const hit = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${MODE_COOKIE}=`))
    ?.split("=")[1];
  return hit === "demo" || hit === "live" ? hit : null;
}

if (typeof window !== "undefined") {
  current =
    readCookie() ??
    (() => {
      try {
        const saved = window.localStorage.getItem(MODE_COOKIE);
        return saved === "demo" || saved === "live" ? saved : "demo";
      } catch {
        return "demo" as DataMode;
      }
    })();
}

export function getDataMode(): DataMode {
  return current;
}

export function setDataMode(mode: DataMode): void {
  current = mode;
  try {
    window.localStorage.setItem(MODE_COOKIE, mode);
  } catch {
    // Private browsing: mode still holds for the session.
  }
  // Cookie mirrors the mode so server pages can gate mock data.
  document.cookie = `${MODE_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
}
