import { STOCKS, type StockSymbol } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export function StockAvatar({
  symbol,
  size = 32,
  className,
}: {
  symbol: StockSymbol;
  size?: number;
  className?: string;
}) {
  const stock = STOCKS[symbol];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={stock.logo}
      alt=""
      width={size}
      height={size}
      className={cn("rounded-full border border-hair bg-card object-cover", className)}
    />
  );
}