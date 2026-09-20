"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StockAvatar } from "@/components/stock-avatar";
import { CornerMark } from "@/components/ui/corner-mark";
import { Reveal } from "@/components/motion/reveal";
import { getPlansSnapshot, getPlansServerSnapshot, subscribePlans, hiddenSeedIds } from "@/lib/plans";
import { STOCKS } from "@/lib/tokens";
import { formatMoney } from "@/lib/format";
import type { Plan } from "@/lib/mock";

// Plans list: demo seeds (passed in) merged with browser-stored plans.
// Stored plans are what make live mode real.
export function UserPlans({ seed }: { seed: Plan[] }) {
  const stored = useSyncExternalStore(subscribePlans, getPlansSnapshot, getPlansServerSnapshot);

  const seen = new Set<string>();
  const plans: Plan[] = [];
  const hidden = hiddenSeedIds();
  for (const p of [...stored, ...seed]) {
    if (p.id && hidden.includes(p.id)) continue;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    plans.push(p);
  }

  if (plans.length === 0) return null;

  return (
    <>
      <div className="mt-12 mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Plans
        </h2>
        <span className="font-mono text-xs text-sub tabular">
          {plans.length} active
        </span>
      </div>
      <Reveal>
        <Card className="relative p-0">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
          <ul className="divide-y divide-hair">
            {plans.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/plan/${p.id}`}
                  className="flex items-center gap-4 p-5 transition-colors hover:bg-paper"
                >
                  <StockAvatar symbol={p.symbol} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {STOCKS[p.symbol].name}{" "}
                      <span className="font-normal text-sub">
                        {p.symbol}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-sub tabular">
                      ${formatMoney(p.amountUsdcPerInterval)} every{" "}
                      {p.intervalDays === 1
                        ? "day"
                        : p.intervalDays === 7
                          ? "week"
                          : "2 weeks"}{" "}
                      · cap {(p.maxPremiumBps / 100).toFixed(2)}%
                    </p>
                  </div>
                  <Pill tone="green">Active</Pill>
                  <span className="hidden text-sub sm:inline" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </>
  );
}
