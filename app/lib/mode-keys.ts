// Server-safe mode constants. lib/mode.ts carries "use client", so anything
// imported from it becomes undefined on the server. Server pages and the
// layout must import from here instead.

export type DataMode = "demo" | "live";

export const MODE_COOKIE = "drip-mode";
export const DEFAULT_MODE: DataMode = "demo";
