import { NextResponse } from "next/server";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

// Daily safety sweep (Vercel Hobby: 1/day max). NOT an intraday keeper:
// the browser gating loop (lib/keeper.ts, 45s tick) owns legs. This route
// answers one question overnight: is any public symbol inside the ±15 min
// multiplier-flip pause, or is a fair feed dead?
//
// Quote checks stay in the browser: keyless Jupiter is 0.5 RPS, so a cron
// fan-out over every symbol would throttle itself. Verdicts here are
// pause | ok | watch | stale, never buy.

const BACKED_CA =
  "https://api.backed.fi/api/v2/public/corporate-actions/history?symbol=";
const KRAKEN = "https://api.kraken.com/0/public/Ticker?pair=";
const TIMEOUT_MS = 6_000;
const PAUSE_MINUTES = 15;

async function getJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function flipsFromRows(rows: unknown, now: Date): Date[] {
  const flips: Date[] = [];
  for (const r of (rows ?? []) as Record<string, unknown>[]) {
    const raw =
      r.exDate ?? r.ex_date ?? r.exTimestamp ?? r.ex_timestamp ?? r.date;
    const t = typeof raw === "number" ? raw * 1000 : Date.parse(String(raw));
    if (!Number.isFinite(t)) continue;
    const ex = new Date(t);
    const flip = new Date(
      Date.UTC(ex.getUTCFullYear(), ex.getUTCMonth(), ex.getUTCDate() + 1, 0, 30, 0),
    );
    const ageH = (now.getTime() - flip.getTime()) / 3_600_000;
    if (ageH > -24 && ageH < 24 + (2 * PAUSE_MINUTES) / 60) flips.push(flip);
  }
  return flips.sort((a, b) => b.getTime() - a.getTime());
}

async function krakenFair(symbol: StockSymbol): Promise<number | null> {
  for (const pair of [`${symbol}USD`, `${symbol.replace(/x$/, "")}USD`]) {
    const json = await getJson(KRAKEN + pair);
    const result = (json as { result?: Record<string, { c?: string[] }> })?.result;
    const last = result ? Object.values(result)[0]?.c?.[0] : undefined;
    const price = last ? Number(last) : NaN;
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
}

export async function GET(): Promise<NextResponse> {
  const now = new Date();
  const symbols = (Object.keys(STOCKS) as StockSymbol[]).filter(
    (s) => STOCKS[s].category === "public",
  );
  const verdicts = await Promise.all(
    symbols.map(async (symbol) => {
      const json = await getJson(BACKED_CA + symbol);
      const rows = Array.isArray(json)
        ? json
        : ((json as { data?: unknown[] })?.data ?? null);
      if (rows === null) {
        return { symbol, state: "watch", reason: "corporate-action feed unreachable" };
      }
      const flip = flipsFromRows(rows, now)[0] ?? null;
      if (flip && Math.abs(now.getTime() - flip.getTime()) / 60_000 <= PAUSE_MINUTES) {
        return {
          symbol,
          state: "pause",
          reason: `multiplier flips ${flip.toISOString()}`,
          flipAtUtc: flip.toISOString(),
        };
      }
      const fair = await krakenFair(symbol);
      if (fair === null) {
        return { symbol, state: "stale", reason: "no fair price" };
      }
      return {
        symbol,
        state: "ok",
        fairUsd: fair,
        flipAtUtc: flip?.toISOString() ?? null,
      };
    }),
  );
  return NextResponse.json({ checkedAtUtc: now.toISOString(), verdicts });
}
