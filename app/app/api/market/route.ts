// Same-origin proxy: PreStocks and Tessera lack CORS headers. Keyless
// public endpoints, brief cache, consistent shape. Pyth stays separate
// (needs the server-side API key).

import { NextResponse } from "next/server";
import { STOCKS, type StockSymbol, type AssetCategory } from "@/lib/tokens";

// Short in-memory cache for demo stability.
const cache = new Map<string, { at: number; body: unknown }>();
const CACHE_MS = 30_000;

interface MarketQuote {
  symbol: StockSymbol;
  category: AssetCategory;
  price: number;
  provider: string;
  name?: string;
  updatedAt: string;
  ageSec: number;
}

// Provider JSON shapes, keyless public endpoints.
interface PreStocksEntry {
  symbol: string;
  tokenPrice?: number;
  markPrice?: number;
  name?: string;
  contract_address?: string;
  image?: string;
}
interface TesseraEntry {
  id: string;
  code: string;
  name: string;
  mint: string;
  markPrice?: number;
}

const PRESTOCKS_URL = "https://prestocks.com/api/prestocks";
const TESSERA_URL = "https://rest-api.tessera.pe/v1/public/token-details";
const TIMEOUT_MS = 8_000;

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "User-Agent": "drip/1.0" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// StockSymbol to provider lookup key.
const PRESTOCKS_KEY: Record<string, string> = {
  SPACEx: "SPACEX",
  OPENAIx: "OPENAI",
  ANTHROPICx: "ANTHROPIC",
  NEURALINKx: "NEURALINK",
  KALSHIx: "KALSHI",
  POLYMARKETx: "POLYMARKET",
  FIGUREAIx: "FIGUREAI",
  ANDURILx: "ANDURIL",
};
const TESSERA_KEY: Record<string, string> = {
  "T-OpenAI": "tOpenAI",
  "T-Kalshi": "tKalshi",
  "T-SpaceX": "tSpaceX",
};

async function fetchPreStocks(): Promise<PreStocksEntry[] | null> {
  const hit = cache.get("prestocks");
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.body as PreStocksEntry[];
  const data = (await fetchJson(PRESTOCKS_URL)) as PreStocksEntry[] | null;
  if (Array.isArray(data)) cache.set("prestocks", { at: Date.now(), body: data });
  return Array.isArray(data) ? data : null;
}
async function fetchTessera(): Promise<TesseraEntry[] | null> {
  const hit = cache.get("tessera");
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.body as TesseraEntry[];
  const data = (await fetchJson(TESSERA_URL)) as TesseraEntry[] | null;
  if (Array.isArray(data)) cache.set("tessera", { at: Date.now(), body: data });
  return Array.isArray(data) ? data : null;
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("symbol") ?? "") as StockSymbol;
  if (!(raw in STOCKS)) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
  }
  const entry = STOCKS[raw];
  if (entry.category === "public") {
    return NextResponse.json(
      { error: "use /api/pyth for public symbols" },
      { status: 400 },
    );
  }

  if (entry.category === "prestocks") {
    const rows = await fetchPreStocks();
    const key = PRESTOCKS_KEY[raw];
    const match = rows?.find(
      (r) =>
        r.symbol?.toUpperCase() === key?.toUpperCase() ||
        r.contract_address === entry.mint,
    );
    const price = Number(match?.tokenPrice ?? match?.markPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "prestocks no price" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      symbol: raw,
      category: entry.category,
      price,
      provider: "prestocks",
      name: match?.name,
      updatedAt: new Date().toISOString(),
      ageSec: 0,
    } satisfies MarketQuote);
  }

  if (entry.category === "tessera") {
    const rows = await fetchTessera();
    const key = TESSERA_KEY[raw];
    const match = rows?.find(
      (r) => r.code?.toLowerCase() === key?.toLowerCase() || r.mint === entry.mint,
    );
    const price = Number(match?.markPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { error: "tessera no price" },
        { status: 502 },
      );
    }
    return NextResponse.json({
      symbol: raw,
      category: entry.category,
      price,
      provider: "tessera",
      name: match?.name,
      updatedAt: new Date().toISOString(),
      ageSec: 0,
    } satisfies MarketQuote);
  }

  return NextResponse.json({ error: "unhandled category" }, { status: 500 });
}
