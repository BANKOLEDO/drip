"use client";

// Demo buys land here (localStorage + subscribers), so the dashboard
// reflects them: activity rows, portfolio totals. Live buys settle
// on-chain instead and never touch this ledger.

export interface DemoFill {
  id: string;
  symbol: string;
  amountUsdc: number;
  shares: number;
  priceUsd: number;
  atUtc: string;
}

const KEY = "drip-demo-fills";
const MAX = 20;

let cache: DemoFill[] | undefined;
const listeners = new Set<() => void>();

function read(): DemoFill[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as DemoFill[]) : [];
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

export function subscribeFills(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getFillsSnapshot(): DemoFill[] {
  if (!cache) cache = read();
  return cache;
}

const NO_FILLS: DemoFill[] = [];

export function getFillsServerSnapshot(): DemoFill[] {
  return NO_FILLS;
}

export function recordDemoFill(fill: Omit<DemoFill, "id" | "atUtc">): DemoFill {
  const entry: DemoFill = {
    ...fill,
    id: `demo-${Date.now().toString(36)}`,
    atUtc: new Date().toISOString(),
  };
  const next = [...getFillsSnapshot(), entry].slice(-MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Session-only if storage is blocked.
  }
  cache = next;
  emit();
  return entry;
}
