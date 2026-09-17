"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StockAvatar } from "@/components/stock-avatar";
import { CornerMark } from "@/components/ui/corner-mark";
import { Reveal } from "@/components/motion/reveal";
import { useMode } from "@/components/mode/mode-context";
import {
  getPlansSnapshot,
  getPlansServerSnapshot,
  subscribePlans,
} from "@/lib/plans";
import type { StockSymbol } from "@/lib/tokens";

export interface ActivityEvent {
  id: string;
  symbol: StockSymbol;
  description: string;
  detail: string;
  atUtc: string;
}

function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const h = Math.round(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

const PULSE: { symbol: StockSymbol; description: string; detail: string }[] = [
  { symbol: "AAPLx", description: "Guard check passed", detail: "Quote +0.45% vs fair, inside 1.00% cap" },
  { symbol: "AAPLx", description: "Buy +$50.00 USDC", detail: "0.19 shares filled at $262.30" },
  { symbol: "SPACEx", description: "Guard deferred a buy", detail: "Quote 5.20x fair, over 3.00% cap" },
  { symbol: "SPYx", description: "Keeper heartbeat", detail: "3 plans evaluated, 0 actions" },
  { symbol: "T-OpenAI", description: "Guard check passed", detail: "Quote +0.40% vs fair, inside 3.00% cap" },
];

const PULSE_MS = 25_000;
const PULSE_KEY = "drip-pulse-n";

// Counter lives in module scope + localStorage, so rows survive page
// switches, reloads, and dev refreshes instead of shrinking back.
let pulseCache: number | undefined;

function readPulse(): number {
  if (pulseCache !== undefined) return pulseCache;
  try {
    pulseCache = Math.max(0, Number(window.localStorage.getItem(PULSE_KEY)) || 0);
  } catch {
    pulseCache = 0;
  }
  return pulseCache;
}

function subscribePulse(cb: () => void) {
  const timer = setInterval(() => {
    pulseCache = readPulse() + 1;
    try {
      window.localStorage.setItem(PULSE_KEY, String(pulseCache));
    } catch {
      // No storage: session-only counting still works.
    }
    cb();
  }, PULSE_MS);
  return () => clearInterval(timer);
}

function getPulseServerSnapshot(): number {
  return 0;
}

// Whole activity block as one client unit: header count covers seeded
// history plus the live demo rows, so the number always matches the rows.
export function ActivitySection({
  baseTotal,
  events,
  page,
  pages,
  seedSymbols,
}: {
  baseTotal: number;
  events: ActivityEvent[];
  page: number;
  pages: number;
  seedSymbols: StockSymbol[];
}) {
  const { mode } = useMode();
  const stored = useSyncExternalStore(subscribePlans, getPlansSnapshot, getPlansServerSnapshot);
  // Pulse only reports on plans actually held. Anything else is noise.
  const held = new Set<StockSymbol>([
    ...seedSymbols,
    ...stored.map((p) => p.symbol),
  ]);
  const pool = PULSE.filter((t) => held.has(t.symbol));
  const subscribe = useCallback(
    (cb: () => void) => (mode === "demo" ? subscribePulse(cb) : () => undefined),
    [mode],
  );
  const pulse = useSyncExternalStore(subscribe, readPulse, getPulseServerSnapshot);
  const n = mode === "demo" ? pulse : 0;

  const live = mode !== "demo" || pool.length === 0 ? [] : Array.from(
    { length: Math.min(n + 1, 3, pool.length) },
    (_, i) => ({ ...pool[(n - i) % pool.length], k: n - i }),
  );

  return (
    <>
      <div className="mt-12 mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            Recent activity
          </h2>
          <p className="mt-0.5 text-sm text-sub">
            Every buy, fill, and guard decision across all plans.
          </p>
        </div>
        <span className="shrink-0 font-mono text-xs text-sub tabular">
          {baseTotal + live.length} events
        </span>
      </div>
      <Reveal>
        <Card className="relative p-0">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
          {live.length > 0 && (
            <div className="border-b border-hair">
              <p className="px-5 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                Happening now · {live.length} live
              </p>
              {live.map((e, i) => (
                <div key={e.k} className="flex items-start gap-4 px-5 py-3">
                  <StockAvatar symbol={e.symbol} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{e.description}</p>
                    <p className="mt-0.5 font-mono text-xs text-sub">{e.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-leaf">
                    {i === 0 ? "now" : "live"}
                  </span>
                </div>
              ))}
            </div>
          )}
          <ul className="divide-y divide-hair">
            {events.map((a) => (
              <li key={a.id} className="flex items-start gap-4 p-5">
                <StockAvatar symbol={a.symbol} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{a.description}</p>
                  <p className="mt-0.5 font-mono text-xs text-sub">{a.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-sub">
                  {timeAgo(a.atUtc)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-4 border-t border-hair px-5 py-3">
            {page > 1 ? (
              <Link
                href={`/dashboard?activityPage=${page - 1}`}
                className="font-mono text-xs text-sub transition-colors hover:text-ink"
              >
                ← Newer
              </Link>
            ) : (
              <span aria-hidden className="font-mono text-xs text-sub/40">
                ← Newer
              </span>
            )}
            <span className="font-mono text-xs text-sub tabular">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link
                href={`/dashboard?activityPage=${page + 1}`}
                className="font-mono text-xs text-sub transition-colors hover:text-ink"
              >
                Older →
              </Link>
            ) : (
              <span aria-hidden className="font-mono text-xs text-sub/40">
                Older →
              </span>
            )}
          </div>
        </Card>
      </Reveal>
    </>
  );
}
