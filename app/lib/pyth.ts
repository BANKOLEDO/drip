// Pyth fair-price source. Reads go through /api/pyth so the key stays
// server-side. Null when down, so callers fall back to Kraken/Yahoo.

import type { StockSymbol } from "./tokens";

// Pyth Core stable feed IDs for Equity.US.<BASE>/USD, scraped from Pyth
// Insights. Public xStocks only. Unverified until a Hermes fetch returns
// a sane price; the route rejects bad prices, the keeper falls back.
export const PYTH_FEED_IDS: Partial<Record<StockSymbol, string>> = {
  AAPLx: "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
  NVDAx:
    "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
  TSLAx:
    "16dad506d7db8da01c87581c87ca897a012a153557d4d578c3b9c9e1bc0632f1",
  SPYx: "19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5",
  MSFTx:
    "d0ca23c1cc005e004ccf1db5bf76aeb6a49218f43dac3d4b275e92de12ded4d1",
  GOOGLx:
    "5a48c03e9b9cb337801073ed9d166817473697efff0d138874e0f6a33d6d5aa6",
  AMZNx:
    "b5d0e0fa58a1f8b81498ae670ce93c872d14434b72c364885d4fa1b257cbb07a",
  METAx:
    "78a3e3b8e676a8f73c439f5d749737034b139bbbe899ba5775216fba596607fe",
  QQQx: "9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d",
  HOODx:
    "306736a4035846ba15a3496eed57225b64cc19230a50d14f3ed20fd7219b7849",
};

export interface PythQuote {
  symbol: StockSymbol;
  price: number;
  confBps: number;
  publishTime: number;
  ageSec: number;
}

// Prices older than 15 min never gate a buy. Confidence wider than 1%
// means the quote is unusable.
export const PYTH_MAX_AGE_SEC = 15 * 60;
export const PYTH_MAX_CONF_BPS = 100;

export function pythPriceIsFresh(q: PythQuote, nowSec = Date.now() / 1000): boolean {
  return (
    Number.isFinite(q.price) &&
    q.price > 0 &&
    q.ageSec >= 0 &&
    q.ageSec <= PYTH_MAX_AGE_SEC &&
    q.publishTime <= nowSec + 60 &&
    q.confBps <= PYTH_MAX_CONF_BPS
  );
}

// Same-origin route, never the Hermes URL. Null when Pyth is down.
export async function pythFairPrice(
  symbol: StockSymbol,
): Promise<{ price: number; ageSec: number } | null> {
  try {
    const res = await fetch(`/api/pyth?symbol=${symbol}`, {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const q = (await res.json()) as PythQuote | { error?: string };
    if (!q || typeof q !== "object" || !("price" in q)) return null;
    const quote = q as PythQuote;
    if (quote.symbol !== symbol) return null;
    return pythPriceIsFresh(quote) ? { price: quote.price, ageSec: quote.ageSec } : null;
  } catch {
    return null;
  }
}
