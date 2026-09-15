import { formatShares, formatScale } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * The persuasive moment: raw shares × multiplier = scaled shares.
 * Rendered in mono, middle term enlarged.
 */
export function ScaledReceipt({
  rawShares,
  scaledShares,
  multiplier,
  className,
  caption,
}: {
  rawShares: number;
  scaledShares: number;
  multiplier: number;
  className?: string;
  caption?: string;
}) {
  return (
    <div className={cn("font-mono", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[min(4.5vw,28px)] leading-tight text-sub tabular">
          {formatShares(rawShares)}
        </span>
        <span className="text-[min(3.5vw,20px)] text-sub">×</span>
        <span className="text-[min(6vw,38px)] leading-tight font-semibold text-ink tabular">
          {formatScale(multiplier)}
        </span>
        <span className="text-[min(3.5vw,20px)] text-sub">=</span>
        <span className="text-[min(6vw,38px)] leading-tight font-semibold text-money-deep tabular">
          {formatShares(scaledShares)}
        </span>
      </div>
      {caption && (
        <p className="mt-2 font-sans text-sm text-sub">{caption}</p>
      )}
    </div>
  );
}