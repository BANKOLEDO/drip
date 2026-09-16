// Live market data for the guard: fair price from Kraken / Pyth /
// PreStocks / Tessera; on-chain quote from Jupiter. Client-safe plain
// fetch with short timeout so callers can fall back to mock data when
// offline or rate-limited.

import { pythFairPrice } from "./pyth";
import { STOCKS, USDC_MINT, type StockSymbol } from "./tokens";

const KRAKEN_TICKER = "https://api.kraken.com/0/public/Ticker?pair=";
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const JUPITER_ORDER = "https://api.jup.ag/swap/v2/order";
const TIMEOUT_MS = 6_000;

export interface PremiumSnapshot {
  fairUsd: number;
  quoteUsd: number;
  quoteBpsOverFair: number;
  maxPremiumBps: number;
  atUtc: string;
}

async function fetchJson(
  url: string,
  init?: { signal?: AbortSignal; headers?: Record<string, string> },
): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      signal: init?.signal ?? AbortSignal.timeout(TIMEOUT_MS),
      headers: init?.headers,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Kraken lists backed tokens as AAPLxUSD (authoritative); for pairs it
// doesn't carry and for networks where Kraken is unreachable, fall back
// to the underlying's last price (the x-token mirrors it).
async function krakenFairPrice(symbol: StockSymbol): Promise<number | null> {
  const candidates = [`${symbol}USD`, `${symbol.replace(/x$/, "")}USD`];
  for (const pair of candidates) {
    const json = await fetchJson(KRAKEN_TICKER + pair);
    const result = (json as { result?: Record<string, { c?: string[] }> })?.result;
    const values = result ? Object.values(result) : [];
    const last = values[0]?.c?.[0];
    const price = last ? Number(last) : NaN;
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

// Universe-wide fallback that is reachable from every region: Yahoo chart
// metadata carries the regular market price for every base symbol.
async function yahooFairPrice(symbol: StockSymbol): Promise<number | null> {
  const base = symbol.replace(/x$/, "");
  const json = await fetchJson(`${YAHOO_CHART}${base}?range=1d&interval=1m`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "drip/1.0 (fair-price feed)" },
  });
  const meta = (json as { chart?: { result?: { meta?: { regularMarketPrice?: number } }[] } })
    ?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  return Number.isFinite(Number(price)) ? Number(price) : null;
}

// Server-side proxy for PreStocks and Tessera (both CORS-blocked in browser).
async function marketProxyFairPrice(symbol: StockSymbol): Promise<number | null> {
  try {
    const res = await fetch(`/api/market?symbol=${encodeURIComponent(symbol)}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { price?: number; symbol?: StockSymbol };
    if (body.symbol !== symbol) return null;
    const p = Number(body.price);
    return Number.isFinite(p) && p > 0 ? p : null;
  } catch {
    return null;
  }
}

async function fairPrice(symbol: StockSymbol): Promise<number | null> {
  const category = STOCKS[symbol].category;
  if (category === "prestocks" || category === "tessera") {
    // Private-market assets: proxy through /api/market. Kraken/Yahoo
    // won't carry them, but the fallback chain keeps things robust.
    return (await marketProxyFairPrice(symbol)) ?? (await yahooFairPrice(symbol));
  }
  // Public equities: Pyth first, Kraken second, Yahoo third.
  return (
    (await pythFairPrice(symbol)) ??
    (await krakenFairPrice(symbol)) ??
    (await yahooFairPrice(symbol))
  );
}

// Keyless quote: how much one share effectively costs buying $amountUsdc now.
async function jupiterQuoteUsd(
  symbol: StockSymbol,
  amountUsdc: number,
): Promise<number | null> {
  const stock = STOCKS[symbol];
  const mint = stock.mint;
  const url =
    `${JUPITER_ORDER}?inputMint=${USDC_MINT}` +
    `&outputMint=${mint}&amount=${Math.round(amountUsdc * 1_000_000)}`;
  const json = await fetchJson(url);
  const outAmount = Number((json as { outAmount?: string })?.outAmount);
  if (!Number.isFinite(outAmount) || outAmount <= 0) return null;
  // Per-asset decimals verified on-chain: xStocks = 8,
  // PreStocks + T-Tokens = 9. The old XSTOCK_DECIMALS constant was wrong
  // for private-market mints.
  const shares = outAmount / 10 ** stock.decimals;
  return amountUsdc / shares;
}

export async function getPremiumSnapshot(
  symbol: StockSymbol,
  amountUsdc: number,
  maxPremiumBps: number,
): Promise<PremiumSnapshot | null> {
  const [fairUsd, quoteUsd] = await Promise.all([
    fairPrice(symbol),
    jupiterQuoteUsd(symbol, amountUsdc),
  ]);
  if (!fairUsd || !quoteUsd) return null;
  const quoteBpsOverFair = Math.round((quoteUsd / fairUsd - 1) * 10_000);
  return { fairUsd, quoteUsd, quoteBpsOverFair, maxPremiumBps, atUtc: new Date().toISOString() };
}
