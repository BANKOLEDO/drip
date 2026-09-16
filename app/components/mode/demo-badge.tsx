"use client";

import { useMode } from "@/components/mode/mode-context";

// Small "Demo data" marker for pages showing numbers. Renders nothing in
// live mode, so live figures are never mistaken for the scripted set.
export function DemoBadge() {
  const { mode } = useMode();
  if (mode !== "demo") return null;
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-sub">
      Demo data
    </span>
  );
}
