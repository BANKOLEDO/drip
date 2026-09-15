"use client";

import { useEffect, useState } from "react";
import { evaluatePlan, type KeeperVerdict } from "@/lib/keeper";
import type { StockSymbol } from "@/lib/tokens";
import { cn } from "@/lib/cn";

// The keeper's heartbeat on the dashboard: re-evaluates the plan on a timer
// (45s, skipped while the tab is hidden) and reports the live verdict. Starts
// as "checking" so SSR and hydration render identically.

const TICK_MS = 45_000;

const tone: Record<KeeperVerdict["state"], string> = {
  buy: "border-money/30 bg-money/10 text-money-deep",
  pause: "border-amber/40 bg-amber/10 text-amber",
  defer: "border-amber/40 bg-amber/10 text-amber",
  watch: "border-hair bg-paper text-sub",
};

const label: Record<KeeperVerdict["state"], string> = {
  buy: "Keeper · buy eligible",
  pause: "Keeper · paused for flip",
  defer: "Keeper · deferred on premium",
  watch: "Keeper · watching",
};

export function KeeperStatus({
  symbol,
  amountUsdc,
  maxPremiumBps,
}: {
  symbol: StockSymbol;
  amountUsdc: number;
  maxPremiumBps: number;
}) {
  const [verdict, setVerdict] = useState<KeeperVerdict | null>(null);

  useEffect(() => {
    let alive = true;
    const ctl = new AbortController();
    const check = async () => {
      if (document.hidden) return;
      try {
        const v = await evaluatePlan(symbol, amountUsdc, maxPremiumBps);
        if (alive && !ctl.signal.aborted) setVerdict(v);
      } catch {
        if (alive && !ctl.signal.aborted) {
          setVerdict({
            state: "watch",
            reason: "Evaluation hiccup. Watching with demo fallback.",
            flipAtUtc: null,
            quoteBpsOverFair: null,
            live: false,
            checkedAtUtc: new Date().toISOString(),
          });
        }
      }
    };
    void check();
    const id = setInterval(() => void check(), TICK_MS);
    return () => {
      alive = false;
      ctl.abort();
      clearInterval(id);
    };
  }, [symbol, amountUsdc, maxPremiumBps]);

  if (!verdict) {
    return (
      <p className="font-mono text-xs tabular text-sub">
        Keeper · checking…
      </p>
    );
  }

  return (
    <p
      aria-live="polite"
      title={verdict.reason}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs tabular",
        tone[verdict.state],
      )}
    >
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label[verdict.state]}
    </p>
  );
}