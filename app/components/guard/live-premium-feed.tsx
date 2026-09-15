"use client";

import { useEffect, useRef, useState } from "react";
import { Pill } from "@/components/ui/pill";
import { PremiumGauge } from "@/components/guard/premium-gauge";
import { PREMIUM_STATE } from "@/lib/mock";
import { getPremiumSnapshot, type PremiumSnapshot } from "@/lib/live";
import { formatMoney } from "@/lib/format";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

const POLL_MS = 30_000;

export function LivePremiumFeed({
  symbol,
  amountUsdc,
}: {
  symbol: StockSymbol;
  amountUsdc: number;
}) {
  const [snap, setSnap] = useState<PremiumSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
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

  const live = snap ?? {
    fairUsd: PREMIUM_STATE.fairUsd,
    quoteUsd: PREMIUM_STATE.quoteUsd,
    quoteBpsOverFair: PREMIUM_STATE.quoteBpsOverFair,
    maxPremiumBps: PREMIUM_STATE.maxPremiumBps,
  };
  const inTolerance = live.quoteBpsOverFair <= live.maxPremiumBps;

  return (
    <>
      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
            Premium guard
          </p>
          <p className="mt-2 text-sm text-sub">
            Fair ${formatMoney(live.fairUsd)} · on-chain quote $
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
        <Pill tone={inTolerance ? "green" : "amber"}>
          {inTolerance ? "Within tolerance" : "Premium spike"}
        </Pill>
      </div>

      <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
            Fair price feed
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
            className={`h-1.5 w-1.5 rounded-full ${snap ? "bg-money" : "bg-amber"}`}
          />
          {snap ? (
            <>
              Live fair price + Jupiter quote · {STOCKS[symbol].symbol}
            </>
          ) : failed ? (
            <>Offline · showing demo feed</>
          ) : (
            <>Loading market data…</>
          )}
        </span>
      </div>
    </>
  );
}