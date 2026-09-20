import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { PauseCountdown } from "@/components/guard/pause-countdown";
import { UserPlans } from "@/components/plan/user-plans";
import { ActivitySection } from "@/components/plan/activity-section";
import { PortfolioHeader } from "@/components/plan/portfolio-header";
import { WelcomeTour } from "@/components/onboarding/welcome-tour";
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
import { formatMoney } from "@/lib/format";

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
        <WelcomeTour />
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
            Set a schedule. Pick a stock. Drip handles the rest, skipping
            the buys that would overpay, so every fill is real.
          </p>
          <ButtonLink href="/create" className="mt-6">
            Create your first plan
          </ButtonLink>
        </Card>
      </main>
    );
  }

  const plan = plans[0];
  const nextBuy = new Date(plan.nextBuyUtc);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <WelcomeTour />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <PortfolioHeader
          basePositions={portfolio.map((p) => ({
            symbol: p.symbol,
            shares: p.scaledShares,
            value: p.scaledShares * p.priceUsd,
          }))}
          seedCount={plans.length}
          seedSymbols={plans.map((p) => p.symbol)}
        />
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
              {STOCKS[plan.symbol].name} · every{" "}
              {plan.intervalDays === 1
                ? "day"
                : plan.intervalDays === 7
                  ? "week"
                  : "2 weeks"}{" "}
              ·{" "}
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
            <p className="mt-1 font-mono text-xs tabular text-sub">
              <PauseCountdown />
            </p>
          </div>
          <KeeperStatus
            symbol={plan.symbol}
            amountUsdc={plan.amountUsdcPerInterval}
            maxPremiumBps={plan.maxPremiumBps}
            showReason
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
      <ActivitySection
        baseTotal={activity.length}
        events={activityEvents}
        page={activityPage}
        pages={totalActivityPages}
        seedSymbols={plans.map((p) => p.symbol)}
      />
    </main>
  );
}