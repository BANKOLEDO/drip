"use client";

// Browser-stored user plans (both modes). Random UUID ids, never
// guessable. Demo seeds its showcase plan separately; stored plans merge
// with the seed on the dashboard and resolve on the plan page.

import type { Plan } from "./mock";
import type { StockSymbol } from "./tokens";

const KEY = "drip-user-plans";

let cache: Plan[] | undefined;
const listeners = new Set<() => void>();

function read(): Plan[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as Plan[]) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function emit() {
  for (const cb of listeners) cb();
}

function onStorage(e: StorageEvent) {
  if (e.key === KEY) {
    cache = undefined;
    emit();
  }
}

export function subscribePlans(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Cached reference so React doesn't loop. Server snapshot is [] for SSR.
export function getPlansSnapshot(): Plan[] {
  if (!cache) cache = read();
  return cache;
}

export function getPlansServerSnapshot(): Plan[] {
  return [];
}

export function listStoredPlans(): Plan[] {
  return getPlansSnapshot();
}

export interface PlanInput {
  symbol: StockSymbol;
  amountUsdcPerInterval: number;
  intervalDays: 1 | 7 | 14;
  maxPremiumBps: number;
}

export function getStoredPlan(id: string): Plan | undefined {
  return getPlansSnapshot().find((p) => p.id === id);
}

export function createStoredPlan(input: PlanInput): Plan {
  const now = new Date();
  const plan: Plan = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `plan-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`,
    status: "active",
    createdAt: now.toISOString(),
    nextBuyUtc: new Date(now.getTime() + input.intervalDays * 86_400_000).toISOString(),
    ...input,
  };
  try {
    const next = [...getPlansSnapshot(), plan];
    window.localStorage.setItem(KEY, JSON.stringify(next));
    cache = next;
    emit();
  } catch {
    // Storage full or blocked: plan still resolves for this session via return.
  }
  return plan;
}
