import type { StockSymbol } from "./tokens";

// Curated demo market: every symbol resolves instantly, zero network.
// Values are illustrative, not quotes. Premiums are scripted so each tab
// tells the guard story: most buys clear, a few spike into deferral.
export const DEMO_MARKET: Record<StockSymbol, { fairUsd: number; bpsOver: number }> = {
  AAPLx: { fairUsd: 261.12, bpsOver: 45 },
  NVDAx: { fairUsd: 192.4, bpsOver: 30 },
  TSLAx: { fairUsd: 331.8, bpsOver: 120 },
  SPYx: { fairUsd: 661.5, bpsOver: 20 },
  MSFTx: { fairUsd: 521.9, bpsOver: 15 },
  GOOGLx: { fairUsd: 201.3, bpsOver: 60 },
  AMZNx: { fairUsd: 231.7, bpsOver: 40 },
  METAx: { fairUsd: 782.4, bpsOver: 90 },
  QQQx: { fairUsd: 642.1, bpsOver: 25 },
  HOODx: { fairUsd: 151.6, bpsOver: 140 },
  SPACEx: { fairUsd: 122.56, bpsOver: 478 },
  OPENAIx: { fairUsd: 96.4, bpsOver: 35 },
  ANTHROPICx: { fairUsd: 58.2, bpsOver: 55 },
  NEURALINKx: { fairUsd: 42.1, bpsOver: 70 },
  KALSHIx: { fairUsd: 31.5, bpsOver: 180 },
  POLYMARKETx: { fairUsd: 22.8, bpsOver: 25 },
  FIGUREAIx: { fairUsd: 18.6, bpsOver: 45 },
  ANDURILx: { fairUsd: 35.9, bpsOver: 65 },
  "T-OpenAI": { fairUsd: 812.79, bpsOver: 40 },
  "T-Kalshi": { fairUsd: 413.8, bpsOver: 85 },
  "T-SpaceX": { fairUsd: 423.0, bpsOver: 110 },
};

export function demoQuoteUsd(symbol: StockSymbol): number {
  const d = DEMO_MARKET[symbol];
  return d.fairUsd * (1 + d.bpsOver / 10_000);
}
