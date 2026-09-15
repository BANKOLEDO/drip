import { cn } from "@/lib/cn";

/**
 * Premium gauge: Jupiter quote vs Kraken fair. Green when within cap,
 * amber when the market quote is over the user's tolerance.
 */
export function PremiumGauge({
  quoteBpsOverFair,
  maxPremiumBps,
  className,
}: {
  quoteBpsOverFair: number;
  maxPremiumBps: number;
  className?: string;
}) {
  const over = quoteBpsOverFair > maxPremiumBps;
  const pct = Math.min(100, (quoteBpsOverFair / maxPremiumBps) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-sub">Quote vs fair</span>
        <span className={cn("tabular font-mono", over ? "text-amber" : "text-money-deep")}>
          +{quoteBpsOverFair} bps{over ? " · over cap" : ` · cap ${maxPremiumBps} bps`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(quoteBpsOverFair)}
        aria-valuemin={0}
        aria-valuemax={maxPremiumBps}
        aria-label="Quote premium vs cap"
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline)]"
      >
        <div
          className={cn("h-full rounded-full transition-all", over ? "bg-amber" : "bg-money")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-sub">
        {over
          ? "Market quote is above your tolerance. Buy deferred to the next window."
          : "Market quote is within your tolerance. Buy will fill."}
      </p>
    </div>
  );
}