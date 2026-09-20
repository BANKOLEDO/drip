"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { closeStoredPlan, hideSeedPlan } from "@/lib/plans";
import { cn } from "@/lib/cn";

// Two-step close: first tap arms, second confirms. Stored plans delete;
// seeded showcase plans hide by id. Lands back on the dashboard.
export function ClosePlanButton({ id, seed = false }: { id: string; seed?: boolean }) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);

  function close() {
    if (seed) hideSeedPlan(id);
    else closeStoredPlan(id);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => (armed ? close() : setArmed(true))}
      onBlur={() => setArmed(false)}
      className={cn(
        "font-mono text-xs transition-colors",
        armed ? "font-semibold text-danger" : "text-sub hover:text-danger",
      )}
    >
      {armed ? "Confirm close" : "Close plan"}
    </button>
  );
}
