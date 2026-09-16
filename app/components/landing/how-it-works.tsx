"use client";

import { useState } from "react";
import Image from "next/image";
import { CornerMark } from "@/components/ui/corner-mark";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    id: "connect",
    tab: "01 Connect",
    title: "Connect",
    body: "Link your Solana wallet. Nothing moves until you approve a buy.",
  },
  {
    id: "amount",
    tab: "02 Amount",
    title: "Pick an amount",
    body: "Choose a stock and how much each week, from $25.",
  },
  {
    id: "guard",
    tab: "03 Guard buys",
    title: "Guard buys",
    body: "Drip buys on schedule and skips when the price is wrong.",
  },
] as const;

// How-it-works as a bottom-nav-style pill: black bar, active segment lit,
// description swaps underneath.
export function HowItWorks() {
  const [active, setActive] = useState<(typeof STEPS)[number]["id"]>("connect");
  const step = STEPS.find((s) => s.id === active)!;

  return (
    <div className="grid items-center gap-6 border-y border-hair py-6 lg:grid-cols-[1fr_280px] lg:gap-4">
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
          How it works
        </p>
        <div
          role="tablist"
          aria-label="How it works"
          className="flex w-fit max-w-full flex-wrap items-center justify-center gap-1 rounded-full border border-white/10 bg-night p-1.5 shadow-lg"
        >
          {STEPS.map((s) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(s.id)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 sm:px-5",
                  on
                    ? "bg-paper font-semibold text-night"
                    : "text-night-muted hover:text-paper",
                )}
              >
                {s.tab}
              </button>
            );
          })}
        </div>
        <div key={step.id} className="animate-fade-lift mt-5 max-w-md">
          <p className="text-base font-semibold text-ink">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-sub">{step.body}</p>
        </div>
      </div>
      <figure className="relative mx-auto w-full max-w-[280px] rotate-[-2deg] border border-hair bg-card p-2 shadow-lg">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <Image
          src="/assets/wallet-poster.jpg"
          alt="A wallet with cash and coins"
          width={560}
          height={560}
          loading="lazy"
          className="h-auto w-full"
        />
        <figcaption className="px-1 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
          Your wallet, your keys
        </figcaption>
      </figure>
    </div>
  );
}
