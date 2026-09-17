"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StockAvatar } from "@/components/stock-avatar";
import { CornerMark } from "@/components/ui/corner-mark";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { GuardPill } from "@/components/guard/guard-pill";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { ExecuteBuy } from "@/components/plan/execute-buy";
import { PriceChart } from "@/components/market/price-chart";
import { DemoBadge } from "@/components/mode/demo-badge";
import { getStoredPlan, getPlansSnapshot, getPlansServerSnapshot, subscribePlans } from "@/lib/plans";
import { STOCKS } from "@/lib/tokens";
import { formatMoney } from "@/lib/format";

// Detail view for browser-stored plans (random UUIDs, both modes). Mock
// showcase plans keep the server view; user plans get live guard and buy.
export function StoredPlanView({ id }: { id: string }) {
  useSyncExternalStore(subscribePlans, getPlansSnapshot, getPlansServerSnapshot);
  const plan = getStoredPlan(id);

  if (plan === undefined) {
    return (
      <Card className="relative p-8 text-center">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
          No such plan
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sub">
          Nothing is stored under this id in this browser. Plans live where
          they were created.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-control bg-money px-5 text-sm font-medium text-white transition-colors hover:bg-money-hover"
        >
          Back to plans
        </Link>
      </Card>
    );
  }

  const stock = STOCKS[plan.symbol];
  const nextBuy = new Date(plan.nextBuyUtc);

  return (
    <div className="flex flex-col gap-4">
      <Card className="relative p-6 sm:p-8">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
          Plan · {plan.id.slice(0, 8)} <DemoBadge />
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <StockAvatar symbol={plan.symbol} size={44} />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {stock.name}{" "}
                <span className="font-mono text-lg text-sub">{plan.symbol}</span>
              </h1>
              <p className="mt-1 text-sm text-sub tabular">
                ${formatMoney(plan.amountUsdcPerInterval)} every{" "}
                {plan.intervalDays === 1 ? "day" : plan.intervalDays === 7 ? "week" : "2 weeks"} · guard
                cap {(plan.maxPremiumBps / 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <Pill tone="green">Active</Pill>
        </div>

        <div className="mt-8 grid gap-8 border-t border-hair pt-8 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Your shares
            </p>
            <p className="mt-3 text-sm leading-relaxed text-sub">
              No fills yet. Your first buy lands here, with its receipt.
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Status
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <GuardPill />
              <KeeperStatus
                symbol={plan.symbol}
                amountUsdc={plan.amountUsdcPerInterval}
                maxPremiumBps={plan.maxPremiumBps}
              />
            </div>
          </div>
        </div>
      </Card>

      <LivePremiumFeed symbol={plan.symbol} amountUsdc={plan.amountUsdcPerInterval} />

      <Card className="relative p-6">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-sub">
          Order ticket
        </p>
        <div className="mb-4 rounded-[3px] border border-hair bg-paper p-3">
          <PriceChart symbol={plan.symbol} />
        </div>
        <ExecuteBuy
          symbol={plan.symbol}
          amountUsdc={plan.amountUsdcPerInterval}
          maxPremiumBps={plan.maxPremiumBps}
        />
      </Card>

      <Card className="divide-y divide-hair p-0">
        <div className="flex items-baseline justify-between gap-4 px-5 py-4 sm:px-6">
          <p className="text-sm text-sub">Next buy</p>
          <p className="text-right text-sm font-semibold text-ink">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            }).format(nextBuy)}
          </p>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-5 py-4 sm:px-6">
          <p className="text-sm text-sub">Created</p>
          <p className="text-right font-mono font-semibold text-ink tabular">
            {plan.createdAt.slice(0, 10)}
          </p>
        </div>
      </Card>

      <div className="mt-2 mb-1 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Guard log
          </h2>
          <p className="mt-0.5 text-sm text-sub">
            Every time the guard paused or waited on this plan.
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-sub tabular">
          0 total
        </span>
      </div>
      <ol className="ml-2 border-l border-hair">
        <li className="pb-0 pl-6 text-sm text-sub">
          No guard events yet. Pauses and waits will land here.
        </li>
      </ol>
    </div>
  );
}
