import { NextResponse } from "next/server";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

// Server-side fair price for public symbols. Browsers can't reach Yahoo
// (no CORS headers) and Kraken hangs in some regions, so the server races
// both and returns the first good number. Private assets stay on
// /api/market.
const KRAKEN = "https://api.kraken.com/0/public/Ticker?pair=";
const YAHOO = "https://query1.finance.yahoo.com/v8/finance/chart/";
const TIMEOUT_MS = 6_000;

async function kraken(pair: string): Promise<number | null> {
  try {
    const res = await fetch(KRAKEN + pair, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: Record<string, { c?: string[] }> };
    const last = json.result ? Object.values(json.result)[0]?.c?.[0] : undefined;
    const price = last ? Number(last) : NaN;
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch {
    return null;
  }
}

async function yahoo(base: string): Promise<number | null> {
  try {
    const res = await fetch(`${YAHOO}${base}?range=1d&interval=1m`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "drip/1.0 (fair-price feed)" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: { meta?: { regularMarketPrice?: number } }[] };
    };
    const price = json.chart?.result?.[0]?.meta?.regularMarketPrice;
    return Number.isFinite(Number(price)) && Number(price) > 0
      ? Number(price)
      : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("symbol") ?? "") as StockSymbol;
  if (!(raw in STOCKS) || STOCKS[raw].category !== "public") {
    return NextResponse.json({ error: "public symbols only" }, { status: 400 });
  }
  const base = raw.replace(/x$/, "");
  const [direct, underlying, fallback] = await Promise.all([
    kraken(`${raw}USD`),
    kraken(`${base}USD`),
    yahoo(base),
  ]);
  const price = direct ?? underlying ?? fallback;
  if (price === null || price === undefined) {
    return NextResponse.json({ error: "no fair price" }, { status: 502 });
  }
  return NextResponse.json({ symbol: raw, price });
}
