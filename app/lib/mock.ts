import { AAPL_DIVIDEND, type StockSymbol } from "./tokens";

export type PlanStatus = "active" | "guarding" | "paused";

export interface Plan {
  id: string;
  symbol: StockSymbol;
  amountUsdcPerInterval: number;
  intervalDays: 1 | 7 | 14;
  maxPremiumBps: number; // 0 = 50, 1 = 100, 2 = 200 basis points
  status: PlanStatus;
  nextBuyUtc: string; // ISO
  createdAt: string;
}

export interface PortfolioPosition {
  symbol: StockSymbol;
  rawShares: number;
  scaledShares: number;
  multiplier: number;
  priceUsd: number;
}

export interface GuardLogEntry {
  symbol: StockSymbol;
  kind: "dividend" | "premium";
  action: "paused" | "deferred";
  atUtc: string;
  detail: string;
}

export const MULTIPLIER_AAPL: number = AAPL_DIVIDEND.multiplierAfter;
export const MULTIPLIER_SPY = 1.005714560286254;

export const mockPlans: Plan[] = [
  {
    id: "demo-aapl-weekly",
    symbol: "AAPLx",
    amountUsdcPerInterval: 50,
    intervalDays: 7,
    maxPremiumBps: 100,
    status: "active",
    nextBuyUtc: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    createdAt: "2026-08-01T10:00:00.000Z",
  },
];

export const mockPortfolio: PortfolioPosition[] = [
  {
    symbol: "AAPLx",
    rawShares: 3.1021194,
    scaledShares: 3.1021194 * MULTIPLIER_AAPL,
    multiplier: MULTIPLIER_AAPL,
    priceUsd: 261.12,
  },
];

export const mockGuardLog: GuardLogEntry[] = [
  {
    symbol: "AAPLx",
    kind: "dividend",
    action: "paused",
    atUtc: AAPL_DIVIDEND.exDateUtc.toISOString(),
    detail: "Paused 00:30 UTC. AAPLx multiplier +0.0605% scaling kept",
  },
  {
    symbol: "SPYx",
    kind: "premium",
    action: "deferred",
    atUtc: "2026-08-05T18:12:00.000Z",
    detail: "Quote 2.1% above fair price. Buy deferred until premium is at or under 1.0%",
  },
];

export const mockActivity = [
  {
    id: "tx-7f3a",
    atUtc: "2026-08-09T14:03:00.000Z",
    symbol: "AAPLx" as StockSymbol,
    description: "Buy +$50.00 USDC",
    detail: "0.4128 AAPLx × 1.0032690 → 0.4141 scaled",
  },
  {
    id: "tx-9c2b",
    atUtc: "2026-08-08T00:45:01.000Z",
    symbol: "AAPLx" as StockSymbol,
    description: "Guard: dividend cut applied",
    detail: "Skipped buy in pause window. Kept +0.0605% share scaling",
  },
];

export const PREMIUM_STATE = {
  quoteBpsOverFair: 45, // 0.45%
  maxPremiumBps: 100, // 1.00% user cap
  healthy: true,
  quoteUsd: 262.3,
  fairUsd: 261.12,
};