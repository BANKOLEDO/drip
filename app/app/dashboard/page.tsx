import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { KeeperStatus } from "@/components/guard/keeper-status";
import { PauseCountdown } from "@/components/guard/pause-countdown";
import { UserPlans } from "@/components/plan/user-plans";
import { EmptyPlans } from "@/components/plan/empty-plans";
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
  const plan = plans[0];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <WelcomeTour />
      <EmptyPlans seedCount={plans.length} />
      {plan && (
        <>
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
              }).format(new Date(plan.nextBuyUtc))}
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
        </>
      )}

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