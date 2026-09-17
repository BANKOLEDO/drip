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
    if (!res.ok) return NextResponse.json({ closes: [] }, { status: 502 });
    const json = (await res.json()) as {
      chart?: { result?: { indicators?: { quote?: { close?: (number | null)[] }[] } }[] };
    };
    const closes = (
      json.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? []
    ).filter((c): c is number => typeof c === "number" && Number.isFinite(c));
    return NextResponse.json({ symbol: raw, closes });
  } catch {
    return NextResponse.json({ closes: [] }, { status: 502 });
  }
}
