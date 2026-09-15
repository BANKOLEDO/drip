// Keeper gating loop: the decision engine behind "the guard". Runs in the
// browser on a timer (demo gating-app per AGENTS.md): each tick it checks
// Backed's corporate-action feed for the next multiplier flip, then the live
// premium snapshot, and returns one verdict: BUY | PAUSE | DEFER | WATCH.
// Client-safe; every external call has a timeout and degrades to WATCH.

import { getPremiumSnapshot } from "./live";
import type { StockSymbol } from "./tokens";

const BACKED_CA =
  "https://api.backed.fi/api/v2/public/corporate-actions/history?symbol=";
const TIMEOUT_MS = 6_000;
const PAUSE_MINUTES = 15;

export type KeeperState = "buy" | "pause" | "defer" | "watch";

export interface KeeperVerdict {
  state: KeeperState;
  reason: string;
  flipAtUtc: string | null;
  quoteBpsOverFair: number | null;
  live: boolean;
  checkedAtUtc: string;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Corporate actions publish an ex-date; the multiplier flips at 00:30 UTC the
// day after. Returns the flips within [+/-1 day] of now, newest first.
export async function upcomingFlips(
  symbol: StockSymbol,
  now: Date,
): Promise<Date[]> {
  const json = await fetchJson(BACKED_CA + symbol);
  const rows = Array.isArray(json)
    ? json
    : ((json as { data?: unknown[] })?.data ?? []);
  const flips: Date[] = [];
  for (const r of rows as Record<string, unknown>[]) {
    const raw =
      r.exDate ?? r.ex_date ?? r.exTimestamp ?? r.ex_timestamp ?? r.date;
    const t = typeof raw === "number" ? raw * 1000 : Date.parse(String(raw));
    if (!Number.isFinite(t)) continue;
    const ex = new Date(t);
    const flip = new Date(
      Date.UTC(ex.getUTCFullYear(), ex.getUTCMonth(), ex.getUTCDate() + 1, 0, 30, 0),
    );
    const ageH = (now.getTime() - flip.getTime()) / 3_600_000;
    if (ageH > -24 && ageH < 24 + 2 * PAUSE_MINUTES / 60) flips.push(flip);
  }
  return flips.sort((a, b) => b.getTime() - a.getTime());
}

export async function evaluatePlan(
  symbol: StockSymbol,
  amountUsdc: number,
  maxPremiumBps: number,
  now = new Date(),
): Promise<KeeperVerdict> {
  const checkedAtUtc = now.toISOString();

  const flips = await upcomingFlips(symbol, now);
  const flip = flips[0] ?? null;
  if (flip) {
    const driftMin = Math.abs(now.getTime() - flip.getTime()) / 60_000;
    if (driftMin <= PAUSE_MINUTES) {
      return {
        state: "pause",
        reason: `${symbol} multiplier flips 00:30 UTC. Standing aside ±${PAUSE_MINUTES} min.`,
        flipAtUtc: flip.toISOString(),
        quoteBpsOverFair: null,
        live: false,
        checkedAtUtc,
      };
    }
  }

  const snap = await getPremiumSnapshot(symbol, amountUsdc, maxPremiumBps);
  if (!snap) {
    return {
      state: "watch",
      reason: "Live feeds unreachable. Watching with demo fallback.",
      flipAtUtc: flip?.toISOString() ?? null,
      quoteBpsOverFair: null,
      live: false,
      checkedAtUtc,
    };
  }
  if (snap.quoteBpsOverFair > maxPremiumBps) {
    return {
      state: "defer",
      reason: `Quote ${snap.quoteBpsOverFair} bps over fair, cap ${maxPremiumBps} bps. Buy waits.`,
      flipAtUtc: flip?.toISOString() ?? null,
      quoteBpsOverFair: snap.quoteBpsOverFair,
      live: true,
      checkedAtUtc,
    };
  }
  return {
    state: "buy",
    reason: `Eligible. Quote ${snap.quoteBpsOverFair} bps over fair, inside cap.`,
    flipAtUtc: flip?.toISOString() ?? null,
    quoteBpsOverFair: snap.quoteBpsOverFair,
    live: true,
    checkedAtUtc,
  };
}