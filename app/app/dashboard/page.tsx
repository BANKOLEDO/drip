import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { StockAvatar } from "@/components/stock-avatar";
import { GuardPill } from "@/components/guard/guard-pill";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { STOCKS } from "@/lib/tokens";
import {
  mockPortfolio,
  mockPlans,
  mockActivity,
} from "@/lib/mock";
import { formatMoney, formatShares } from "@/lib/format";

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function DashboardPage() {
  const hasPlans = mockPlans.length > 0;

  if (!hasPlans) {
    return (
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
        <Card className="flex flex-col items-center px-8 py-16 text-center">
          <Image
            src="/assets/empty-state.jpg"
            alt="A quiet droplet waiting to drip"
            width={1200}
            height={400}
            sizes="100vw"
            className="mb-8 h-auto w-full max-w-md rounded-card border border-hair"
          />
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
            No plans yet
          </h1>
          <p className="mt-3 max-w-sm text-center text-sub">
            Set a schedule. Pick a stock. Drip handles the rest, pausing around
            dividend flips and premium spikes so every fill is real.
          </p>
          <ButtonLink href="/create" className="mt-6">
            Create your first plan
          </ButtonLink>
        </Card>
      </main>
    );
  }

  const position = mockPortfolio[0];
  const value = position.scaledShares * position.priceUsd;
  const plan = mockPlans[0];
  const nextBuy = new Date(plan.nextBuyUtc);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
            Portfolio value
          </p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight text-ink tabular sm:text-6xl">
            ${formatMoney(value)}
          </h1>
          <p className="mt-3 text-sm text-sub">
            {formatShares(position.scaledShares, 4)} scaled {position.symbol} ·{" "}
            1 active plan
          </p>
        </div>
        <ButtonLink href="/create">New plan</ButtonLink>
      </div>

      {/* Status ledger */}
      <Card className="divide-y divide-hair p-0">
        <div className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Next buy
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold text-ink tabular">
              ${formatMoney(plan.amountUsdcPerInterval)}
            </p>
            <p className="mt-1 text-sm text-sub">
              {STOCKS[plan.symbol].name} ·{" "}
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
                timeZoneName: "short",
              }).format(nextBuy)}
            </p>
          </div>
          <GuardPill />
          <KeeperStatus
            symbol={plan.symbol}
            amountUsdc={plan.amountUsdcPerInterval}
            maxPremiumBps={plan.maxPremiumBps}
          />
        </div>

        <LivePremiumFeed
          symbol={plan.symbol}
          amountUsdc={plan.amountUsdcPerInterval}
        />
      </Card>

      {/* Plans */}
      <h2 className="mt-12 mb-4 font-display text-2xl font-medium tracking-tight text-ink">
        Plans
      </h2>
      <Card className="p-0">
        <ul className="divide-y divide-hair">
          {mockPlans.map((p) => (
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

      {/* Activity */}
      <h2 className="mt-12 mb-4 font-display text-2xl font-medium tracking-tight text-ink">
        Recent activity
      </h2>
      <Card className="p-0">
        <ul className="divide-y divide-hair">
          {mockActivity.map((a) => (
            <li key={a.id} className="flex items-start gap-4 p-5">
              <StockAvatar symbol={a.symbol} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{a.description}</p>
                <p className="mt-0.5 font-mono text-xs text-sub">{a.detail}</p>
              </div>
              <span className="shrink-0 text-xs text-sub">
                {timeAgo(a.atUtc)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}