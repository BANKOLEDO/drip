"use client";

import { useState } from "react";
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
  const [broken, setBroken] = useState(false);
  // Tessera publishes no logos, so T-Tokens show the company initial
  // (O/K/S), not the "T-" prefix.
  const initial = stock.name.replace(/^T-/, "").charAt(0);

  if (broken) {
    return (
      <span
        aria-hidden
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-money font-semibold text-paper",
          className,
        )}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={stock.logo}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setBroken(true)}
      className={cn("rounded-full border border-hair bg-card object-cover", className)}
    />
  );
}