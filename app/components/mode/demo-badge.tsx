"use client";

import { useMode } from "@/components/mode/mode-context";

// "Demo data" marker for pages showing numbers. Hidden in live mode.
export function DemoBadge() {
  const { mode } = useMode();
  if (mode !== "demo") return null;
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
      Demo data
    </span>
  );
}
