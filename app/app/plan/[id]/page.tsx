import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { StockAvatar } from "@/components/stock-avatar";
import { ScaledReceipt } from "@/components/guard/scaled-receipt";
import { GuardPill } from "@/components/guard/guard-pill";
import { PremiumGauge } from "@/components/guard/premium-gauge";
import { ExecuteBuy } from "@/components/plan/execute-buy";
import { mockPlans, mockPortfolio, mockGuardLog, PREMIUM_STATE } from "@/lib/mock";
import { STOCKS } from "@/lib/tokens";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/cn";
import Link from "next/link";

function intervalLabel(days: 1 | 7 | 14) {
  if (days === 1) return "day";
  if (days === 7) return "week";
  return "2 weeks";
}

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = mockPlans.find((p) => p.id === id);
  if (!plan) return notFound();

  const position = mockPortfolio[0];
  const value = position.scaledShares * position.priceUsd;
  const nextBuy = new Date(plan.nextBuyUtc);
  const stock = STOCKS[plan.symbol];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-sub transition-colors hover:text-ink"
      >
        ← Back to dashboard
      </Link>

      {/* Status hero */}
      <Card className="border-money/20 bg-money/[0.02] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <StockAvatar symbol={plan.symbol} size={44} />
            <div>
              <h1 className="font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                {stock.name}{" "}
                <span className="text-sub">{plan.symbol}</span>
              </h1>
              <p className="mt-1 text-sm text-sub tabular">
                ${formatMoney(plan.amountUsdcPerInterval)} every{" "}
                {intervalLabel(plan.intervalDays)} · guard cap{" "}
                {(plan.maxPremiumBps / 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <Pill tone="green">Active</Pill>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Scaled shares
            </p>
            <ScaledReceipt
              rawShares={position.rawShares}
              scaledShares={position.scaledShares}
              multiplier={position.multiplier}
              caption="Your shares, post AAPLx dividend scale"
              className="mt-3"
            />
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Status
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <GuardPill />
              <PremiumGauge
                quoteBpsOverFair={PREMIUM_STATE.quoteBpsOverFair}
                maxPremiumBps={plan.maxPremiumBps}
              />
              <div className="mt-2 border-t border-hair pt-4">
                <ExecuteBuy
                  symbol={plan.symbol}
                  amountUsdc={plan.amountUsdcPerInterval}
                  maxPremiumBps={plan.maxPremiumBps}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metadata ledger */}
      <Card className="mt-6 divide-y divide-hair p-0">
        <MetaRow
          label="Portfolio value"
          value={`$${formatMoney(value)}`}
          mono
        />
        <MetaRow
          label="Next buy"
          value={new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          }).format(nextBuy)}
        />
        <MetaRow label="Created" value={plan.createdAt.slice(0, 10)} mono />
      </Card>

      {/* Guard log */}
      <h2 className="mt-12 mb-4 font-display text-2xl font-medium tracking-tight text-ink">
        Guard log
      </h2>
      <ol className="ml-2 border-l border-hair">
        {mockGuardLog.map((entry, i) => (
          <li key={i} className="relative pb-8 pl-6 last:pb-0">
            <span
              className={cn(
                "absolute left-0 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full",
                entry.action === "paused" ? "bg-amber" : "bg-money",
              )}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
                {entry.kind} · {entry.action}
              </p>
              <time className="font-mono text-xs text-sub">
                {entry.atUtc.slice(0, 16).replace("T", " ")} UTC
              </time>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink">
              {entry.detail}
            </p>
          </li>
        ))}
        {mockGuardLog.length === 0 && (
          <li className="pb-0 pl-6 text-sm text-sub">No guard events yet.</li>
        )}
      </ol>
    </main>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-4 sm:px-6">
      <p className="text-sm text-sub">{label}</p>
      <p
        className={cn(
          "text-right font-semibold text-ink",
          mono && "font-mono tabular",
          !mono && "text-sm",
        )}
      >
        {value}
      </p>
    </div>
  );
}