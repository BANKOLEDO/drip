// Live market data for the guard. Fair price from Kraken / Pyth /
// PreStocks / Tessera; on-chain quote from Jupiter. Short timeouts so
// callers fall back fast when offline or rate-limited.

import { pythFairPrice } from "./pyth";
import { DEMO_MARKET, demoQuoteUsd } from "./demo";
import { getDataMode } from "./mode";
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
  // Age of the fair price. The keeper never buys on stale data.
  fairAgeSec: number | null;
  atUtc: string;
}

// Fair price plus its age. The guard acts on both.
export interface FairQuote {
  price: number;
  ageSec: number;
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

// Kraken lists backed tokens as AAPLxUSD; otherwise falls back to the
// underlying's price. Both pairs fire in parallel so one slow pair can't
// stall the guard.
async function krakenFairPrice(symbol: StockSymbol): Promise<FairQuote | null> {
  const pairs = [`${symbol}USD`, `${symbol.replace(/x$/, "")}USD`];
  const responses = await Promise.all(
    pairs.map((pair) => fetchJson(KRAKEN_TICKER + pair)),
  );
  for (const json of responses) {
    const result = (json as { result?: Record<string, { c?: string[] }> })?.result;
    const values = result ? Object.values(result) : [];
    const last = values[0]?.c?.[0];
    const price = last ? Number(last) : NaN;
    if (Number.isFinite(price) && price > 0) return { price, ageSec: 0 };
  }
  return null;
}

// Yahoo chart metadata carries the market price for every base symbol.
// Reachable from every region; the fallback of last resort.
async function yahooFairPrice(symbol: StockSymbol): Promise<FairQuote | null> {
  const base = symbol.replace(/x$/, "");
  const json = await fetchJson(`${YAHOO_CHART}${base}?range=1d&interval=1m`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "User-Agent": "drip/1.0 (fair-price feed)" },
  });
  const meta = (json as { chart?: { result?: { meta?: { regularMarketPrice?: number } }[] } })
    ?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  return Number.isFinite(Number(price)) && Number(price) > 0
    ? { price: Number(price), ageSec: 0 }
    : null;
}

// Server-side proxy for PreStocks and Tessera (both CORS-blocked in browser).
async function marketProxyFairPrice(symbol: StockSymbol): Promise<FairQuote | null> {
  try {
    const res = await fetch(`/api/market?symbol=${encodeURIComponent(symbol)}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { price?: number; symbol?: StockSymbol };
    if (body.symbol !== symbol) return null;
    const p = Number(body.price);
    return Number.isFinite(p) && p > 0 ? { price: p, ageSec: 0 } : null;
  } catch {
    return null;
  }
}

export async function fairPrice(symbol: StockSymbol): Promise<FairQuote | null> {
  // Demo mode: curated instant numbers, zero network.
  if (getDataMode() === "demo") {
    return { price: DEMO_MARKET[symbol].fairUsd, ageSec: 0 };
  }
  const category = STOCKS[symbol].category;
  if (category === "prestocks" || category === "tessera") {
    // No Kraken coverage here: proxy first, Yahoo fallback.
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
  if (getDataMode() === "demo") return demoQuoteUsd(symbol);
  const stock = STOCKS[symbol];
  const mint = stock.mint;
  const url =
    `${JUPITER_ORDER}?inputMint=${USDC_MINT}` +
    `&outputMint=${mint}&amount=${Math.round(amountUsdc * 1_000_000)}`;
  const json = await fetchJson(url);
  const outAmount = Number((json as { outAmount?: string })?.outAmount);
  if (!Number.isFinite(outAmount) || outAmount <= 0) return null;
  // Per-asset decimals, verified on-chain: xStocks 8, PreStocks/T-Tokens 9.
  const shares = outAmount / 10 ** stock.decimals;
  return amountUsdc / shares;
}

export async function getPremiumSnapshot(
  symbol: StockSymbol,
  amountUsdc: number,
  maxPremiumBps: number,
): Promise<PremiumSnapshot | null> {
  const [fair, quoteUsd] = await Promise.all([
    fairPrice(symbol),
    jupiterQuoteUsd(symbol, amountUsdc),
  ]);
  if (!fair || !quoteUsd) return null;
  const fairUsd = fair.price;
  const quoteBpsOverFair = Math.round((quoteUsd / fairUsd - 1) * 10_000);
  return { fairUsd, quoteUsd, quoteBpsOverFair, maxPremiumBps, fairAgeSec: fair.ageSec, atUtc: new Date().toISOString() };
}
