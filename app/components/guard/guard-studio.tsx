"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, type IconifyIcon } from "@iconify/react";
import pauseButton from "@iconify-icons/fluent-emoji-flat/pause-button";
import chartIncreasing from "@iconify-icons/fluent-emoji-flat/chart-increasing";
import receipt from "@iconify-icons/fluent-emoji-flat/receipt";
import shield from "@iconify-icons/fluent-emoji-flat/shield";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { CornerMark } from "@/components/ui/corner-mark";
import { cn } from "@/lib/cn";
import type { StockSymbol } from "@/lib/tokens";

type CategoryId = "public" | "prestocks" | "tessera";

const TABS: { id: CategoryId; label: string; symbol: StockSymbol }[] = [
  { id: "public", label: "Public", symbol: "AAPLx" },
  { id: "prestocks", label: "PreStocks", symbol: "SPACEx" },
  { id: "tessera", label: "T-Tokens", symbol: "T-OpenAI" },
];

const RULES: { title: string; body: string; pills: string[]; icon: IconifyIcon }[] = [
  {
    title: "Pause on dividend day",
    body: "When a stock pays a dividend, its price resets overnight. Drip waits for the reset instead of buying the old price.",
    pills: ["00:30 UTC", "± 15 min"],
    icon: pauseButton,
  },
  {
    title: "Wait when the price spikes",
    body: "If the price inside the app runs above the real-world price, the buy pauses until the next window.",
    pills: ["1.00% cap", "45s recheck"],
    icon: chartIncreasing,
  },
  {
    title: "Receipts for every buy",
    body: "Every buy records exactly what you got, scaled for dividends, in a receipt anyone can check.",
    pills: ["raw × scaled", "provable"],
    icon: receipt,
  },
];

export function GuardStudio() {
  const [active, setActive] = useState<CategoryId>("public");
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});

  const symbol = TABS.find((t) => t.id === active)!.symbol;

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  useEffect(() => {
    const onResize = () => {
      const el = tabRefs.current[active];
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  return (
    <div className="flex flex-col items-center gap-4 md:gap-5">
      {/* Bordered panel with corner registration marks */}
      <div className="relative w-full overflow-hidden border border-hair bg-card">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />

        {/* Slim header: eyebrow + title left, sliding tab pill right */}
        <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
          <div className="flex min-w-0 flex-col items-start gap-1">
            <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
              <Icon icon={shield} className="size-4" /> Price guard
            </p>
            <h3 className="truncate text-lg font-semibold tracking-tight text-ink sm:text-xl">
              Watch the guard run right now.
            </h3>
            <p className="max-w-xl text-pretty text-sm text-sub">
              Drip checks the real-world price before every buy. If the price
              inside the app is too high, it waits for the next window. Switch
              tabs to watch a public company, a pre-IPO startup, or a
              community token.
            </p>
          </div>

          <div className="relative flex w-fit shrink-0 items-center gap-1 self-start rounded-full border border-hair bg-paper p-1 sm:self-auto">
            <div
              className="absolute top-1 bottom-1 rounded-full bg-money transition-all duration-300 ease-out"
              style={{ left: pill.left, width: pill.width }}
            />
            {TABS.map((tab) => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  aria-pressed={isActive}
                  className={cn(
                    "relative z-10 flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors duration-300",
                    isActive ? "font-semibold text-paper" : "text-sub hover:text-ink",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live guard feed, full width inside a corner-marked frame */}
        <div className="relative w-full border-b border-hair p-3 sm:p-4">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />
<LivePremiumFeed
              key={symbol}
              symbol={symbol}
              amountUsdc={50}
              className="w-full border-0 bg-transparent rounded-none"
            />
        </div>

        {/* The three rules, as tier cards */}
        <div className="grid grid-cols-1 divide-y divide-hair md:grid-cols-3 md:divide-x md:divide-y-0">
          {RULES.map((rule) => (
            <div
              key={rule.title}
              className="flex h-full flex-col items-start gap-3 p-5"
            >
              <p className="flex items-center gap-2 font-semibold text-ink">
                <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border border-hair bg-tint/40">
                  <Icon icon={rule.icon} className="size-5" />
                </span>
                {rule.title}
              </p>
              <p className="text-sm leading-relaxed text-sub">{rule.body}</p>
              <div className="mt-auto flex w-full flex-wrap gap-1.5">
                {rule.pills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dotted foundation strip */}
        <div aria-hidden className="relative h-6 flex-1 overflow-hidden border-t bg-tint/40">
          <svg className="absolute inset-0 h-full w-full">
            <pattern
              id="guard-dots"
              x="0"
              y="0"
              width="12"
              height="12"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="6" cy="6" r="0.75" fill="var(--hairline)" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#guard-dots)" />
          </svg>
        </div>
      </div>
    </div>
  );
}