// Live market data for the guard. Fair price from Kraken / Pyth /
// PreStocks / Tessera; on-chain quote from Jupiter. Short timeouts so
// callers fall back fast when offline or rate-limited.

import { pythFairPrice } from "./pyth";
import { DEMO_MARKET, demoQuoteUsd, demoWobble } from "./demo";
import { getDataMode } from "./mode";
import { STOCKS, USDC_MINT, type StockSymbol } from "./tokens";

const KRAKEN_TICKER = "https://api.kraken.com/0/public/Ticker?pair=";
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const JUPITER_ORDER = "https://api.jup.ag/swap/v2/order";
const TIMEOUT_MS = 4_000;

// Rolling session trace per symbol: every successful fair read appends.
// Feeds the chart for assets with no intraday API (private markets). Real
// polls only, grows during the session, never backfilled.

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
// Fair price plus its age. The guard acts on both.
export interface FairQuote {
  price: number;
  ageSec: number;
}

const TRACE_MAX = 48;
const traces = new Map<StockSymbol, number[]>();

export function recordTrace(symbol: StockSymbol, price: number): void {
  const arr = traces.get(symbol) ?? [];
  arr.push(price);
  if (arr.length > TRACE_MAX) arr.splice(0, arr.length - TRACE_MAX);
  traces.set(symbol, arr);
}

export function sessionTrace(symbol: StockSymbol): number[] {
  return traces.get(symbol) ?? [];
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

// Same-origin fair proxy: the server races Kraken + Yahoo without CORS
// or regional hangs. First choice in browsers, direct chain as backup.
async function apiFairPrice(symbol: StockSymbol): Promise<FairQuote | null> {
  try {
    const res = await fetch(`/api/fair?symbol=${encodeURIComponent(symbol)}`, {
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

// Server-side proxy for PreStocks and Tessera (CORS-blocked in browser).
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
    const price = DEMO_MARKET[symbol].fairUsd * demoWobble();
    recordTrace(symbol, price);
    return { price, ageSec: 0 };
  }
  const category = STOCKS[symbol].category;
  // All sources fire at once; priority picks the winner. Worst case is one
  // timeout, not the sum of four.
  const [proxy, yahoo, pyth, kraken, server] = await Promise.all([
    category === "prestocks" || category === "tessera"
      ? marketProxyFairPrice(symbol)
      : Promise.resolve(null),
    yahooFairPrice(symbol),
    category === "public" ? pythFairPrice(symbol) : Promise.resolve(null),
    category === "public" ? krakenFairPrice(symbol) : Promise.resolve(null),
    category === "public" ? apiFairPrice(symbol) : Promise.resolve(null),
  ]);
  if (category === "prestocks" || category === "tessera") {
    const quote = proxy ?? yahoo;
    if (quote) recordTrace(symbol, quote.price);
    return quote;
  }
  const quote = server ?? pyth ?? kraken ?? yahoo;
  if (quote) recordTrace(symbol, quote.price);
  return quote;
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
