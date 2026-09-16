"use client";

import { useEffect, useRef, useState } from "react";
import { fairPrice } from "@/lib/live";
import { useMode } from "@/components/mode/mode-context";
import { formatMoney } from "@/lib/format";
import { StockAvatar } from "@/components/stock-avatar";
import type { StockSymbol } from "@/lib/tokens";

// Live market tape: real fair prices across all three asset classes
// (public xStocks, PreStocks, T-Tokens). Seamless marquee on every
// screen width, no internal scrolling. Polls every 45s and keeps the
// last good value on screen while the next one loads.

const WATCH: { symbol: StockSymbol; label: string }[] = [
  { symbol: "AAPLx", label: "Public" },
  { symbol: "NVDAx", label: "Public" },
  { symbol: "TSLAx", label: "Public" },
  { symbol: "SPYx", label: "Public" },
  { symbol: "MSFTx", label: "Public" },
  { symbol: "GOOGLx", label: "Public" },
  { symbol: "SPACEx", label: "PreStocks" },
  { symbol: "OPENAIx", label: "PreStocks" },
  { symbol: "ANTHROPICx", label: "PreStocks" },
  { symbol: "KALSHIx", label: "PreStocks" },
  { symbol: "T-OpenAI", label: "T-Tokens" },
  { symbol: "T-SpaceX", label: "T-Tokens" },
];

const POLL_MS = 45_000;

function TickerQuote({
  symbol,
  label,
  price,
}: {
  symbol: StockSymbol;
  label: string;
  price?: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-6">
      <StockAvatar symbol={symbol} size={18} />
      <span className="font-mono text-xs uppercase tracking-[0.14em] text-night-muted">
        {symbol}
      </span>
      <span className="font-mono text-sm font-semibold tabular text-paper">
        {price !== undefined && price > 0 ? (
          `$${formatMoney(price)}`
        ) : (
          <span className="text-night-muted/60">…</span>
        )}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-night-muted">
        {label}
      </span>
    </div>
  );
}

export function LiveTickTape() {
  const [prices, setPrices] = useState<Partial<Record<StockSymbol, number>>>({});
  const [offline, setOffline] = useState(true);
  const { mode } = useMode();
  const runId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    runId.current += 1;
    const id = runId.current;

    async function tick() {
      if (document.hidden) return;
      const entries = await Promise.all(
        WATCH.map(async ({ symbol }) => {
          const q = await fairPrice(symbol);
          return [symbol, q?.price ?? null] as const;
        }),
      );
      if (cancelled || id !== runId.current) return;
      const next: Partial<Record<StockSymbol, number>> = {};
      let anyLive = false;
      for (const [symbol, p] of entries) {
        if (p !== null && p > 0) {
          next[symbol] = p;
          anyLive = true;
        }
      }
      setPrices((prev) => ({ ...prev, ...next }));
      setOffline(!anyLive);
    }

    void tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const row = (key: "a" | "b") => (
    <div
      key={key}
      aria-hidden={key === "b"}
      className="flex shrink-0 items-center"
    >
      {WATCH.map(({ symbol, label }) => (
        <TickerQuote
          key={symbol}
          symbol={symbol}
          label={label}
          price={prices[symbol]}
        />
      ))}
      <div className="flex shrink-0 items-center gap-3 px-6">
        <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-night-muted/70">
          {offline ? "offline" : mode === "demo" ? "demo prices" : "live fair prices"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="group relative overflow-hidden border-t border-hair bg-night">
      {/* Edge fades so the tape disappears into the paper, not hard-cuts */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-night to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-night to-transparent"
      />

      <div className="marquee-track flex w-max py-3 group-hover:[animation-play-state:paused]">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}