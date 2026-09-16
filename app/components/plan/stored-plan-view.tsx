"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StockAvatar } from "@/components/stock-avatar";
import { CornerMark } from "@/components/ui/corner-mark";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { ExecuteBuy } from "@/components/plan/execute-buy";
import { DemoBadge } from "@/components/mode/demo-badge";
import { getStoredPlan, getPlansSnapshot, getPlansServerSnapshot, subscribePlans } from "@/lib/plans";
import { STOCKS } from "@/lib/tokens";
import { formatMoney } from "@/lib/format";

// Detail view for browser-stored plans (created on /create with random
// UUIDs, both modes). Mock showcase plans keep the richer server view;
// user plans get the live guard, live feed, and a working buy button.
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
        <div className="mt-6 border-t border-hair pt-4">
          <KeeperStatus
            symbol={plan.symbol}
            amountUsdc={plan.amountUsdcPerInterval}
            maxPremiumBps={plan.maxPremiumBps}
          />
        </div>
      </Card>

      <LivePremiumFeed symbol={plan.symbol} amountUsdc={plan.amountUsdcPerInterval} />

      <Card className="relative p-6">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
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
    </div>
  );
}
