"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockAvatar } from "@/components/stock-avatar";
import { CornerMark } from "@/components/ui/corner-mark";
import { STOCKS, CATEGORY_LABEL, CATEGORY_DEFAULT_CAP_BPS, type AssetCategory, type StockSymbol } from "@/lib/tokens";
import { createStoredPlan } from "@/lib/plans";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";

const symbols = Object.keys(STOCKS) as StockSymbol[];
const presets = [25, 50, 100, 250];
const intervals = [
  { value: 1, label: "Daily" },
  { value: 7, label: "Weekly" },
  { value: 14, label: "Every 2 weeks" },
] as const;
// Cap presets follow the market: tight for public equities, wider where
// pre-IPO and community tokens trade thin.
const capPresets: Record<AssetCategory, readonly { bps: number; label: string; desc: string }[]> = {
  public: [
    { bps: 50, label: "0.50%", desc: "Strict" },
    { bps: 100, label: "1.00%", desc: "Balanced" },
    { bps: 200, label: "2.00%", desc: "Loose" },
  ],
  prestocks: [
    { bps: 100, label: "1.00%", desc: "Strict" },
    { bps: 300, label: "3.00%", desc: "Balanced" },
    { bps: 500, label: "5.00%", desc: "Loose" },
  ],
  tessera: [
    { bps: 100, label: "1.00%", desc: "Strict" },
    { bps: 300, label: "3.00%", desc: "Balanced" },
    { bps: 500, label: "5.00%", desc: "Loose" },
  ],
};

function intervalLabel(days: 1 | 7 | 14) {
  if (days === 1) return "day";
  if (days === 7) return "week";
  return "2 weeks";
}

export default function CreatePage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState<StockSymbol>("AAPLx");
  const [amount, setAmount] = useState(50);
  const [intervalDays, setIntervalDays] = useState<1 | 7 | 14>(7);
  const [maxBps, setMaxBps] = useState(100);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const plan = createStoredPlan({
      symbol,
      amountUsdcPerInterval: amount,
      intervalDays,
      maxPremiumBps: maxBps,
    });
    router.push(`/plan/${plan.id}`);
  }

  const category = STOCKS[symbol].category;
  const caps = capPresets[category];
  const premium = caps.find((p) => p.bps === maxBps)?.label ?? `${(maxBps / 100).toFixed(2)}%`;
  const annual = amount * (365 / intervalDays);

  function pickSymbol(s: StockSymbol) {
    const nextCategory = STOCKS[s].category;
    setSymbol(s);
    if (nextCategory !== category) setMaxBps(CATEGORY_DEFAULT_CAP_BPS[nextCategory]);
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
        New plan
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Set a cadence. Drip handles the guard.
      </h1>
      <p className="mt-4 max-w-xl text-pretty text-sub">
        Pick a stock, pick an amount, pick a schedule. The premium guard
        defers buys when the on-chain quote runs above fair value.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Which stock?
            </legend>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {symbols.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => pickSymbol(s)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-card border p-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-info",
                    symbol === s
                      ? "border-money bg-money text-paper"
                      : "border-hair bg-card text-sub hover:border-sub hover:text-ink",
                  )}
                >
                  <StockAvatar symbol={s} size={36} />
                  <span>{s}</span>
                  <span
                    className={cn(
                      "font-mono text-[9px] uppercase tracking-[0.14em]",
                      symbol === s ? "text-paper/70" : "text-sub/60",
                    )}
                  >
                    {CATEGORY_LABEL[STOCKS[s].category]}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              How much each buy?
            </legend>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={cn(
                    "rounded-control border px-4 py-2 font-mono text-sm transition-colors",
                    amount === p
                      ? "border-money bg-money font-semibold text-paper"
                      : "border-hair bg-card text-sub hover:border-sub hover:text-ink",
                  )}
                >
                  ${p}
                </button>
              ))}
              <label className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-sub">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  max={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value) || 1)}
                  className="h-10 w-36 rounded-control border border-hair bg-card pl-6 pr-3 font-mono text-sm text-ink tabular placeholder:text-sub/50 focus:border-money focus:outline-none focus:ring-1 focus:ring-money/30"
                  placeholder="0"
                  aria-label="Custom amount"
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Schedule
            </legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {intervals.map((iv) => (
                <button
                  key={iv.value}
                  type="button"
                  onClick={() => setIntervalDays(iv.value)}
                  className={cn(
                    "rounded-control border px-4 py-2 text-sm font-medium transition-colors",
                    intervalDays === iv.value
                      ? "border-money bg-money font-semibold text-paper"
                      : "border-hair bg-card text-sub hover:border-sub hover:text-ink",
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Premium guard tolerance
            </legend>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {caps.map((pm) => (
                <button
                  key={pm.bps}
                  type="button"
                  onClick={() => setMaxBps(pm.bps)}
                  className={cn(
                    "rounded-card border p-4 text-left transition-colors",
                    maxBps === pm.bps
                      ? "border-money bg-money"
                      : "border-hair bg-card hover:border-sub",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-lg font-semibold tabular",
                      maxBps === pm.bps ? "text-paper" : "text-ink",
                    )}
                  >
                    {pm.label}
                  </span>
                  <span
                    className={cn(
                      "ml-2 text-xs",
                      maxBps === pm.bps ? "text-paper/70" : "text-sub",
                    )}
                  >
                    {pm.desc}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-sub">
              If the on-chain quote is above this cap, Drip defers the buy until
              the next window.
            </p>
          </fieldset>
        </div>

        <Card className="relative lg:sticky lg:top-24">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
            Plan preview
          </p>
          <div className="mt-4 flex items-center gap-3">
            <StockAvatar symbol={symbol} size={40} />
            <div>
              <p className="font-semibold text-ink">{STOCKS[symbol].name}</p>
              <p className="font-mono text-xs text-sub">{symbol}</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-hair border-y border-hair">
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-sub">Per buy</dt>
              <dd className="font-mono font-semibold text-ink tabular">
                ${formatMoney(amount)}
              </dd>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-sub">Cadence</dt>
              <dd className="font-semibold text-ink">
                Every {intervalLabel(intervalDays)}
              </dd>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-sub">Per year</dt>
              <dd className="font-mono font-semibold text-ink tabular">
                ~${formatMoney(annual)}
              </dd>
            </div>
            <div className="flex justify-between py-3 text-sm">
              <dt className="text-sub">Guard cap</dt>
              <dd className="font-mono font-semibold text-ink tabular">
                {premium}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs leading-relaxed text-sub">
            The program never swaps and never holds your funds. Each buy is
            signed by your wallet through Jupiter, and the guard pauses it
            around dividend flips and premium spikes.
          </p>

          <Button type="submit" className="mt-5 w-full" size="lg">
            Start plan
          </Button>
        </Card>
      </form>
    </main>
  );
}