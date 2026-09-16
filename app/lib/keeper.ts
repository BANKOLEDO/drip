// Keeper: checks corporate actions, then the price snapshot. Verdicts:
// BUY | PAUSE | DEFER | WATCH | STALE. Fail-closed, stale data pauses.

import { getPremiumSnapshot } from "./live";
import { getDataMode } from "./mode";
import type { StockSymbol } from "./tokens";

const BACKED_CA =
  "https://api.backed.fi/api/v2/public/corporate-actions/history?symbol=";
const TIMEOUT_MS = 6_000;
const PAUSE_MINUTES = 15;

export type KeeperState = "buy" | "pause" | "defer" | "watch" | "stale";

// Fair prices older than this never gate a buy. Stale data pauses.
export const STALE_FAIR_SEC = 15 * 60;
// Deferrals hold until premium cools to 80% of cap (no boundary flapping).
export const RESUME_RATIO = 0.8;

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
): Promise<{ flips: Date[]; live: boolean }> {
  if (getDataMode() === "demo") return { flips: [], live: true };
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
  return { flips: flips.sort((a, b) => b.getTime() - a.getTime()), live: json !== null };
}

export async function evaluatePlan(
  symbol: StockSymbol,
  amountUsdc: number,
  maxPremiumBps: number,
  now = new Date(),
  prevState: KeeperState | null = null,
): Promise<KeeperVerdict> {
  const checkedAtUtc = now.toISOString();

  const { flips, live: actionsLive } = await upcomingFlips(symbol, now);
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
  if (snap.fairAgeSec !== null && snap.fairAgeSec > STALE_FAIR_SEC) {
    return {
      state: "stale",
      reason: `Fair price is ${Math.round(snap.fairAgeSec / 60)} min old. Standing aside until feeds recover.`,
      flipAtUtc: flip?.toISOString() ?? null,
      quoteBpsOverFair: snap.quoteBpsOverFair,
      live: true,
      checkedAtUtc,
    };
  }
  // Hysteresis: enter deferral above cap, leave it only once premium cools
  // to 80% of cap. Kills buy/defer flapping at the boundary.
  const resumeLine = prevState === "defer" ? Math.round(maxPremiumBps * RESUME_RATIO) : maxPremiumBps;
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
  if (snap.quoteBpsOverFair > resumeLine) {
    return {
      state: "defer",
      reason: `Holding deferral until premium cools under ${resumeLine} bps.`,
      flipAtUtc: flip?.toISOString() ?? null,
      quoteBpsOverFair: snap.quoteBpsOverFair,
      live: true,
      checkedAtUtc,
    };
  }
  const unverified = actionsLive
    ? ""
    : " Corporate-action feed unreachable, dividend pause unverified.";
  return {
    state: "buy",
    reason: `Eligible. Quote ${snap.quoteBpsOverFair} bps over fair, inside cap.${unverified}`,
    flipAtUtc: flip?.toISOString() ?? null,
    quoteBpsOverFair: snap.quoteBpsOverFair,
    live: true,
    checkedAtUtc,
  };
}