"use client";

import { useMode } from "@/components/mode/mode-context";
import { useWallet } from "@solana/wallet-adapter-react";
import { cn } from "@/lib/cn";

// Demo/Live switch in the header. Flipping to demo drops the wallet:
// scripted figures next to a connected address would imply real money.
export function ModeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useMode();
  const { connected, disconnect } = useWallet();

  function pick(next: "demo" | "live") {
    if (next === "demo" && connected) void disconnect();
    setMode(next);
  }
  return (
    <div
      role="group"
      aria-label="Data mode"
      title={mode === "demo" ? "Demo data (instant, scripted)" : "Live market data"}
      className={cn(
        "flex items-center gap-0.5 rounded-full border border-hair bg-card",
        compact ? "p-0.5" : "p-1",
      )}
    >
      {(["demo", "live"] as const).map((m) => {
        const on = mode === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => pick(m)}
            aria-pressed={on}
            className={cn(
              "cursor-pointer rounded-full font-mono uppercase tracking-[0.12em] transition-colors",
              compact ? "px-2 py-1 text-[10px]" : "px-3 py-1 text-[11px]",
              on ? "bg-money font-semibold text-paper" : "text-sub hover:text-ink",
            )}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
