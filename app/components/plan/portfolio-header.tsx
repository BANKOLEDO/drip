"use client";

import { useSyncExternalStore } from "react";
import { DemoBadge } from "@/components/mode/demo-badge";
import {
  getFillsSnapshot,
  getFillsServerSnapshot,
  subscribeFills,
} from "@/lib/demo-ledger";
import {
  getPlansSnapshot,
  getPlansServerSnapshot,
  subscribePlans,
} from "@/lib/plans";
import { formatMoney, formatShares } from "@/lib/format";
import type { StockSymbol } from "@/lib/tokens";

// Portfolio header that grows with demo fills. Demo buys for this position
// add straight in; anything else is out of scope for the demo ledger.
export function PortfolioHeader({
  basePositions,
  seedCount,
  seedSymbols,
}: {
  basePositions: { symbol: StockSymbol; shares: number; value: number }[];
  seedCount: number;
  seedSymbols: StockSymbol[];
}) {
  const fills = useSyncExternalStore(subscribeFills, getFillsSnapshot, getFillsServerSnapshot);
  const stored = useSyncExternalStore(subscribePlans, getPlansSnapshot, getPlansServerSnapshot);
  const symbols = new Set<StockSymbol>([
    ...basePositions.map((p) => p.symbol),
    ...seedSymbols,
    ...stored.map((p) => p.symbol),
  ]);
  const rows = [...symbols].map((symbol) => {
    const base = basePositions.find((p) => p.symbol === symbol);
    const mine = fills.filter((f) => f.symbol === symbol);
    return {
      symbol,
      shares: (base?.shares ?? 0) + mine.reduce((n, f) => n + f.shares, 0),
      value:
        (base?.value ?? 0) + mine.reduce((n, f) => n + f.amountUsdc, 0),
    };
  });
  const total = rows.reduce((n, r) => n + r.value, 0);
  const plans = seedCount + stored.length;

  return (
    <div>
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
        Portfolio value <DemoBadge />
      </p>
      <h1 className="mt-2 text-5xl font-semibold tracking-tight text-ink tabular sm:text-6xl">
        ${formatMoney(total)}
      </h1>
      <p className="mt-3 text-sm text-sub">
        {rows.map((r) => `${formatShares(r.shares, 4)} ${r.symbol}`).join(" · ")}
        {" · "}
        {plans} active plan{plans === 1 ? "" : "s"}
      </p>
    </div>
  );
}
