// Live market data for the guard: fair price from Kraken, on-chain
// quote from Jupiter. Client-safe plain fetch with short timeout so
// callers can fall back to mock data when offline or rate-limited.

import { STOCKS, USDC_MINT, type StockSymbol } from "./tokens";

const KRAKEN_TICKER = "https://api.kraken.com/0/public/Ticker?pair=";
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const JUPITER_ORDER = "https://api.jup.ag/swap/v2/order";
const TIMEOUT_MS = 6_000;

// Backed xStocks use 8 base decimals; scaled-UI multiplier never touches raw quote math.
const XSTOCK_DECIMALS = 8;

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
    const result = (json as { result?: Record<string, { c?: string[] }> })
      ?.result;
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

async function fairPrice(symbol: StockSymbol): Promise<number | null> {
  return (await krakenFairPrice(symbol)) ?? (await yahooFairPrice(symbol));
}

// Keyless quote: how much one share effectively costs buying $amountUsdc now.
async function jupiterQuoteUsd(
  symbol: StockSymbol,
  amountUsdc: number,
): Promise<number | null> {
  const mint = STOCKS[symbol].mint;
  const url =
    `${JUPITER_ORDER}?inputMint=${USDC_MINT}` +
    `&outputMint=${mint}&amount=${Math.round(amountUsdc * 1_000_000)}`;
  const json = await fetchJson(url);
  const outAmount = Number((json as { outAmount?: string })?.outAmount);
  if (!Number.isFinite(outAmount) || outAmount <= 0) return null;
  const shares = outAmount / 10 ** XSTOCK_DECIMALS;
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