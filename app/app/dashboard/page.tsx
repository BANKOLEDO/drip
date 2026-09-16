import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { StockAvatar } from "@/components/stock-avatar";
import { GuardPill } from "@/components/guard/guard-pill";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { UserPlans } from "@/components/plan/user-plans";
import { DemoBadge } from "@/components/mode/demo-badge";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { CornerMark } from "@/components/ui/corner-mark";
import { Reveal } from "@/components/motion/reveal";
import { STOCKS } from "@/lib/tokens";
import { MODE_COOKIE, DEFAULT_MODE } from "@/lib/mode-keys";
import { cookies } from "next/headers";
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

const ACTIVITY_PAGE_SIZE = 5;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ activityPage?: string }>;
}) {
  const sp = await searchParams;
  // Seeds exist in demo only. Live shows the empty state until on-chain
  // plan reads land.
  const jar = await cookies();
  const pageMode = jar.get(MODE_COOKIE)?.value === "live" ? "live" : DEFAULT_MODE;
  const plans = pageMode === "demo" ? mockPlans : [];
  const portfolio = pageMode === "demo" ? mockPortfolio : [];
  const activity = pageMode === "demo" ? mockActivity : [];
  const totalActivityPages = Math.max(
    1,
    Math.ceil(activity.length / ACTIVITY_PAGE_SIZE),
  );
  const activityPage = Math.min(
    Math.max(1, Number(sp.activityPage ?? 1) || 1),
    totalActivityPages,
  );
  const activityEvents = activity.slice(
    (activityPage - 1) * ACTIVITY_PAGE_SIZE,
    activityPage * ACTIVITY_PAGE_SIZE,
  );
  const hasPlans = plans.length > 0;

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

  const position = portfolio[0];
  const value = position.scaledShares * position.priceUsd;
  const plan = plans[0];
  const nextBuy = new Date(plan.nextBuyUtc);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
            Portfolio value <DemoBadge />
          </p>
          <h1 className="mt-2 text-5xl font-semibold tracking-tight text-ink tabular sm:text-6xl">
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
      <Reveal>
        <Card className="relative p-0">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
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
      </Card>
      </Reveal>

      <Reveal once>
        <LivePremiumFeed
          className="mt-4"
          symbol={plan.symbol}
          amountUsdc={plan.amountUsdcPerInterval}
        />
      </Reveal>

      {/* Plans: seeded showcase plus the user's own stored plans */}
      <UserPlans seed={plans} />

      {/* Activity */}
      <div className="mt-12 mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">
          Recent activity
        </h2>
        <span className="font-mono text-xs text-sub tabular">
          {activity.length} events
        </span>
      </div>
      <Reveal>
        <Card className="relative p-0">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
          <ul className="divide-y divide-hair">
            {activityEvents.map((a) => (
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
          <div className="flex items-center justify-between gap-4 border-t border-hair px-5 py-3">
            {activityPage > 1 ? (
              <Link
                href={`/dashboard?activityPage=${activityPage - 1}`}
                className="font-mono text-xs text-sub transition-colors hover:text-ink"
              >
                ← Newer
              </Link>
            ) : (
              <span aria-hidden className="font-mono text-xs text-sub/40">
                ← Newer
              </span>
            )}
            <span className="font-mono text-xs text-sub tabular">
              Page {activityPage} of {totalActivityPages}
            </span>
            {activityPage < totalActivityPages ? (
              <Link
                href={`/dashboard?activityPage=${activityPage + 1}`}
                className="font-mono text-xs text-sub transition-colors hover:text-ink"
              >
                Older →
              </Link>
            ) : (
              <span aria-hidden className="font-mono text-xs text-sub/40">
                Older →
              </span>
            )}
          </div>
      </Card>
      </Reveal>
    </main>
  );
}