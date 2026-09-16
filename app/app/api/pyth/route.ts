// Pyth proxy: keeps PYTH_API_KEY server-side.
//
// GET /api/pyth?symbol=AAPLx. Failures fall back to Kraken/Yahoo.

import { NextResponse } from "next/server";
import { PYTH_FEED_IDS } from "@/lib/pyth";
import type { StockSymbol } from "@/lib/tokens";

const HERMES_URL =
  process.env.PYTH_HERMES_URL ?? "https://hermes.pyth.network";

interface HermesPrice {
  price: string;
  conf: string;
  expo: number;
  publish_time: number;
}

interface HermesFeed {
  id: string;
  price?: HermesPrice;
}

const KNOWN_SYMBOLS = new Set<string>(Object.keys(PYTH_FEED_IDS));

function isStockSymbol(s: string): s is StockSymbol {
  return KNOWN_SYMBOLS.has(s);
}

export async function GET(req: Request): Promise<NextResponse> {
  const key = process.env.PYTH_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "pyth key missing" }, { status: 503 });
  }
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("symbol") ?? "";
  if (!isStockSymbol(raw)) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
  }
  const id = PYTH_FEED_IDS[raw];
  if (!id) {
    return NextResponse.json({ error: "no feed id" }, { status: 502 });
  }
  let res: Response;
  try {
    res = await fetch(
      `${HERMES_URL}/api/latest_price_feeds?ids[]=${id}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(8_000),
      },
    );
  } catch {
    return NextResponse.json({ error: "pyth unreachable" }, { status: 502 });
  }
  if (!res.ok) {
    return NextResponse.json({ error: `pyth ${res.status}` }, { status: 502 });
  }
  let feeds: HermesFeed[];
  try {
    feeds = (await res.json()) as HermesFeed[];
  } catch {
    return NextResponse.json({ error: "pyth bad json" }, { status: 502 });
  }
  const feed = feeds.find((f) => f.id === id) ?? feeds[0];
  const p = feed?.price;
  if (!p) {
    return NextResponse.json({ error: "pyth no price" }, { status: 502 });
  }
  const nowSec = Date.now() / 1000;
  const price = Number(p.price) * 10 ** p.expo;
  const conf = Number(p.conf) * 10 ** p.expo;
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "pyth bad price" }, { status: 502 });
  }
  return NextResponse.json({
    symbol: raw,
    price,
    confBps: Math.round((conf / price) * 10_000),
    publishTime: p.publish_time,
    ageSec: Math.round(nowSec - p.publish_time),
  });
}
