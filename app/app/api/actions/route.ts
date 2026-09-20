import { NextResponse } from "next/server";
import { STOCKS, type StockSymbol } from "@/lib/tokens";

// Server-side Backed proxy: corporate-action history has no CORS headers,
// so browsers can never read it directly. Without this route the keeper
// never sees flips and always reports the feed unreachable.
const BACKED_CA =
  "https://api.backed.fi/api/v2/public/corporate-actions/history?symbol=";
const TIMEOUT_MS = 8_000;

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("symbol") ?? "") as StockSymbol;
  if (!(raw in STOCKS)) {
    return NextResponse.json({ error: "unknown symbol" }, { status: 400 });
  }
  try {
    const res = await fetch(BACKED_CA + raw, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return NextResponse.json({ error: "backed down" }, { status: 502 });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "backed unreachable" }, { status: 502 });
  }
}
