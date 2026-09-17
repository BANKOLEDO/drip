"use client";

import { useEffect, useRef, useState } from "react";
import { Pill } from "@/components/ui/pill";
import { PremiumGauge } from "@/components/guard/premium-gauge";
import { PREMIUM_STATE } from "@/lib/mock";
import { Card } from "@/components/ui/card";
import { getPremiumSnapshot, type PremiumSnapshot } from "@/lib/live";
import { DEMO_MARKET, demoQuoteUsd } from "@/lib/demo";
import { useMode } from "@/components/mode/mode-context";
import { formatMoney } from "@/lib/format";
import { STOCKS, type StockSymbol } from "@/lib/tokens";
import { cn } from "@/lib/cn";

const POLL_MS = 30_000;

export function LivePremiumFeed({
  symbol,
  amountUsdc,
  className,
}: {
  symbol: StockSymbol;
  amountUsdc: number;
  className?: string;
}) {
  const [snap, setSnap] = useState<PremiumSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const { mode } = useMode();
  const runId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    runId.current += 1;
    const id = runId.current;

    async function tick() {
      const s = await getPremiumSnapshot(
        symbol,
        amountUsdc,
        PREMIUM_STATE.maxPremiumBps,
      );
      if (cancelled || id !== runId.current) return;
      if (s) {
        setSnap(s);
        setFailed(false);
      } else {
        setFailed(true);
      }
    }

    void tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [symbol, amountUsdc]);

  const demo = DEMO_MARKET[symbol];
  const live = snap ?? {
    fairUsd: demo.fairUsd,
    quoteUsd: demoQuoteUsd(symbol),
    quoteBpsOverFair: demo.bpsOver,
    maxPremiumBps: PREMIUM_STATE.maxPremiumBps,
  };
  const inTolerance = live.quoteBpsOverFair <= live.maxPremiumBps;

  return (
    <Card className={cn("p-0", className)}>
      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
            Price guard
          </p>
          <p className="mt-2 text-sm text-sub">
            Fair ${formatMoney(live.fairUsd)} · app price $
            {formatMoney(live.quoteUsd)} ·{" "}
            <span className="font-medium text-ink tabular">
              {live.quoteBpsOverFair > 0 ? "+" : ""}
              {(live.quoteBpsOverFair / 100).toFixed(2)}%
            </span>{" "}
            vs fair
          </p>
          <div className="mt-3 max-w-sm">
            <PremiumGauge
              quoteBpsOverFair={live.quoteBpsOverFair}
              maxPremiumBps={live.maxPremiumBps}
            />
          </div>
        </div>
        <Pill
          tone={inTolerance ? "green" : "money"}
          className="justify-self-start sm:justify-self-end"
        >
          {inTolerance ? "Good to buy" : "Price spike"}
        </Pill>
      </div>

      <div className="grid gap-4 border-t border-hair p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
            Real price
          </p>
          {snap ? (
            <p
              key={snap.atUtc}
              className="animate-scale-in mt-2 inline-block font-mono text-2xl font-semibold text-ink tabular"
            >
              ${formatMoney(live.fairUsd)}
            </p>
          ) : failed ? (
            <p className="mt-2 font-mono text-2xl font-semibold text-ink tabular">
              ${formatMoney(live.fairUsd)}
            </p>
          ) : (
            <div className="animate-shimmer mt-3 h-8 w-36 rounded-control border border-hair" />
          )}
        </div>
        <span className="flex items-center gap-2 text-sm text-sub">
          <span
            className={`h-1.5 w-1.5 rounded-full ${snap && mode === "live" ? "bg-money" : "bg-sub"}`}
          />
          {snap ? (
            <>
              {mode === "demo" ? "Demo feed" : "Live prices"} · {STOCKS[symbol].symbol}
            </>
          ) : failed ? (
            <>Offline · showing demo feed</>
          ) : (
            <>Loading market data…</>
          )}
        </span>
      </div>
    </Card>
  );
}