import { NextResponse } from "next/server";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

// Intraday closes for the plan-page chart. Yahoo carries public underlyings
// only; private assets get an empty series and the chart hides itself.
const YAHOO_CHART = "https://query1.finance.yahoo.com/v8/finance/chart/";
const TIMEOUT_MS = 8_000;

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("symbol") ?? "") as StockSymbol;
  if (!(raw in STOCKS)) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
  }
  const base = raw.replace(/x$/, "");
  try {
    const res = await fetch(`${YAHOO_CHART}${base}?range=1d&interval=5m`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "drip/1.0 (chart feed)" },
    });
    if (!res.ok) return NextResponse.json({ candles: [] }, { status: 502 });
    const json = (await res.json()) as {
      chart?: {
        result?: {
          timestamp?: number[];
          indicators?: {
            quote?: {
              open?: (number | null)[];
              high?: (number | null)[];
              low?: (number | null)[];
              close?: (number | null)[];
              volume?: (number | null)[];
            }[];
          };
        }[];
      };
    };
    const result = json.chart?.result?.[0];
    const times = result?.timestamp ?? [];
    const q = result?.indicators?.quote?.[0];
    const candles: { t: number; o: number; h: number; l: number; c: number; v: number }[] = [];
    for (let i = 0; i < times.length; i++) {
      const o = q?.open?.[i];
      const h = q?.high?.[i];
      const l = q?.low?.[i];
      const c = q?.close?.[i];
      if (
        typeof o !== "number" || typeof h !== "number" ||
        typeof l !== "number" || typeof c !== "number" ||
        ![o, h, l, c].every(Number.isFinite)
      ) {
        continue;
      }
      const v = q?.volume?.[i];
      candles.push({
        t: times[i],
        o, h, l, c,
        v: typeof v === "number" && Number.isFinite(v) ? v : 0,
      });
    }
    return NextResponse.json({ symbol: raw, candles });
  } catch {
    return NextResponse.json({ candles: [] }, { status: 502 });
  }
}
