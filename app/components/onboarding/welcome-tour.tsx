"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CornerMark } from "@/components/ui/corner-mark";
import { useMode } from "@/components/mode/mode-context";
import {
  getPlansSnapshot,
} from "@/lib/plans";

const FLAG = "drip-tour-done";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function shouldShow(): boolean {
  try {
    return (
      !window.localStorage.getItem(FLAG) && getPlansSnapshot().length === 0
    );
  } catch {
    return false;
  }
}

// First-run overview card. Live mode only (demo already shows a seeded
// plan), once per browser, before the user has any plan.
export function WelcomeTour() {
  const { mode } = useMode();
  const show = useSyncExternalStore(subscribe, shouldShow, () => false);
  const [gone, setGone] = useState(false);

  function dismiss() {
    try {
      window.localStorage.setItem(FLAG, "1");
    } catch {
      // No storage: hide for this session only.
    }
    setGone(true);
  }

  if (!show || gone || mode !== "live") return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to Drip"
      className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="relative w-full max-w-md border border-hair bg-card p-6 shadow-xl sm:p-8">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
          Welcome to Drip
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          Your money, on a schedule. Guarded.
        </h2>
        <ol className="mt-5 flex flex-col gap-3">
          {[
            ["01", "Pick a stock and a weekly amount.", "Apple, NVIDIA, SpaceX, 21 assets."],
            ["02", "The guard checks every buy.", "Wrong price or dividend flip: it waits."],
            ["03", "Every fill leaves a receipt.", "Raw shares times scaled, provable."],
          ].map(([n, title, body]) => (
            <li key={n} className="flex gap-3">
              <span className="font-mono text-xs text-money-deep tabular">{n}</span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-sm text-sub">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/create"
            onClick={dismiss}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-control bg-money px-5 text-sm font-medium text-white transition-colors hover:bg-money-hover"
          >
            Create a plan
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-hair bg-transparent px-5 text-sm font-medium text-ink transition-colors hover:border-ink"
          >
            Look around first
          </button>
        </div>
      </div>
    </div>
  );
}
