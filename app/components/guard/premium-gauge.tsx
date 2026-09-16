import { cn } from "@/lib/cn";

// Price gauge: app price vs fair. Always black; state reads from text.
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
        <span className="font-medium text-ink">Quote vs fair</span>
        <span className="tabular font-mono text-ink">
          +{(quoteBpsOverFair / 100).toFixed(2)}%
          {over ? " · over cap" : ` · cap ${(maxPremiumBps / 100).toFixed(2)}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={Math.round(quoteBpsOverFair)}
        aria-valuemin={0}
        aria-valuemax={maxPremiumBps}
        aria-label="App price vs fair cap"
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--hairline)]"
      >
        <div className="h-full rounded-full bg-money transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-ink">
        {over
          ? "Market quote is above your tolerance. Buy deferred to the next window."
          : "Market quote is within your tolerance. Buy will fill."}
      </p>
    </div>
  );
}