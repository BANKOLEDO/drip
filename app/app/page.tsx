import Image from "next/image";
import { ScaledReceipt } from "@/components/guard/scaled-receipt";
import { NextGuardWindow } from "@/components/guard/next-guard-window";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { BrowserMock } from "@/components/device/browser-mock";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { Wave } from "@/components/divider/wave";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { IconCalendar, IconShield, IconChart } from "@/components/icons";
import { AAPL_DIVIDEND } from "@/lib/tokens";
import { MULTIPLIER_AAPL } from "@/lib/mock";

const proof = {
  raw: 0.9874123,
  multiplier: MULTIPLIER_AAPL,
  scaled: 0.9874123 * MULTIPLIER_AAPL,
};

const guardRules = [
  {
    icon: <IconCalendar />,
    title: "Pause on ex-date",
    body: "The 00:30 UTC multiplier flip, plus 15 minutes either side. Your buy waits for the reset.",
  },
  {
    icon: <IconShield />,
    title: "Defer on premium",
    body: "On-chain quote above fair value means the buy holds for the next window instead of catching a spike.",
  },
  {
    icon: <IconChart />,
    title: "Receipts, always",
    body: "Every fill records raw shares times multiplier. Your position is always the real, scaled number.",
  },
];

const steps = [
  {
    n: "01",
    title: "Pick a stock and cadence",
    body: "$50 every week into AAPLx. Set it once and let the schedule run.",
  },
  {
    n: "02",
    title: "Drip guards the window",
    body: "It pauses for dividend flips and steps aside during premium spikes — automatically.",
  },
  {
    n: "03",
    title: "Every cent is accounted for",
    body: "Each fill lands as a scaled receipt you can verify on chain.",
  },
];

export default function Home() {
  return (
    <main className="paper-ruled flex-1">
      {/* Hero: editorial type on the brand asset */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/assets/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 15% 42%, rgba(244,241,232,0.97) 0%, rgba(244,241,232,0.9) 46%, rgba(244,241,232,0.6) 78%, rgba(244,241,232,0.45) 100%)",
          }}
        />
        <div aria-hidden className="pattern-drips-soft pointer-events-none absolute inset-0" />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-20">
          <div className="max-w-3xl">
            <Reveal>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-money-deep">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-money" />
                Recurring DCA · Tokenized US stocks · Solana
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-8 font-display text-5xl font-medium leading-[1.0] tracking-tight text-ink sm:text-7xl lg:text-[5.25rem]">
                Auto-invest in US stocks.
                <span className="block text-money-deep">
                  It knows when not to buy.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-sub sm:text-lg">
                Drip buys on your schedule and steps aside exactly when it
                must — for dividend multiplier cuts and weekend premium
                spikes — accounting for every cent in scaled shares.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row">
                <ButtonLink href="/create" size="lg" className="w-full sm:w-auto">
                  Create a plan
                </ButtonLink>
                <ButtonLink
                  href="/dashboard"
                  variant="quiet"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  See a live plan
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mt-10 flex flex-col items-start gap-4 border-t border-hair pt-6 sm:flex-row sm:items-center sm:gap-6">
                <NextGuardWindow />
                <p className="text-sm text-sub">
                  No custody. Your wallet signs every swap.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div aria-hidden className="ruler-scale relative h-3 text-money/70" />
      </section>

      {/* Guard: why Drip is not a bot */}
      <section className="pattern-night relative bg-night text-paper">
        <Wave fill="text-paper" />
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-money">
                  The guard
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-paper sm:text-6xl">
                  A bot knows when to buy.
                  <br />
                  <span className="text-money">A guard knows when not to.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-night-muted sm:text-lg">
                  Dividend cuts reset the price at 00:30 UTC, and weekend gaps
                  can push the on-chain quote far above fair value. Any bot
                  keeps buying through both. Drip watches the feed and steps
                  out of the way.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="mt-8">
                  <NextGuardWindow variant="dark" />
                </div>
              </Reveal>
            </div>

            <div className="flex flex-col justify-center gap-4">
              {guardRules.map((r, i) => (
                <Reveal key={r.title} delay={0.1 + i * 0.08}>
                  <div className="grid gap-4 rounded-card border border-white/10 bg-night-soft p-5 sm:grid-cols-[auto_1fr] sm:gap-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-card border border-money/25 bg-money/10 text-money [&>svg]:h-5 [&>svg]:w-5">
                      {r.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-medium text-paper">
                        {r.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-night-muted">
                        {r.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live guard at work: real market feed */}
      <section className="relative bg-tint">
        <Wave fill="text-night" />
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div>
              <Reveal>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-money-deep">
                  Live guard at work
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
                  Every buy is checked against a live fair price.
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-sub sm:text-lg">
                  This is the premium guard running right now on AAPLx — fair
                  price from a market feed, on-chain quote from Jupiter. When
                  the quote clears tolerance, Drip buys. When it does not, Drip
                  waits.
                </p>
              </Reveal>
            </div>
            <Reveal from="right" delay={0.12}>
              <Card className="p-0">
                <LivePremiumFeed symbol="AAPLx" amountUsdc={50} />
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The dividend math: real receipt */}
      <section className="relative bg-paper">
        <Wave fill="text-tint" />
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal from="left">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
                  Scaled-share accounting
                </p>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
                  The math is not hidden. It is the hero.
                </h2>
                <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-sub sm:text-lg">
                  When AAPLx paid its dividend, the multiplier stepped from{" "}
                  <span className="font-mono text-ink">1.0026642</span> to{" "}
                  <span className="font-mono text-ink">1.0032690</span>. Every
                  share scaled up 0.0605%. Drip shows the raw times multiplier
                  split on every fill, and guards the flip so you never buy the
                  wrong side.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-6">
                  <Stat
                    label="Gross dividend"
                    value={0.27}
                    prefix="$"
                    decimals={2}
                  />
                  <Stat label="Withholding" value={30} suffix="%" />
                  <Stat label="Net credited" value={0.189} prefix="$" decimals={3} />
                </div>
              </div>
            </Reveal>

            <Reveal from="right" delay={0.12}>
              <Card className="lg:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://xstocks-metadata.backed.fi/logos/tokens/AAPLx.png"
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border border-hair"
                    />
                    <div>
                      <p className="text-sm font-semibold text-ink">AAPLx</p>
                      <p className="text-xs text-sub">Apple · dividend fill</p>
                    </div>
                  </div>
                  <Pill tone="green">Verified on chain</Pill>
                </div>

                <ScaledReceipt
                  rawShares={proof.raw}
                  scaledShares={proof.scaled}
                  multiplier={proof.multiplier}
                  caption="A dividend scaled your shares up. The receipt proves it."
                />

                <p className="mt-6 font-mono text-xs text-sub">
                  Multiplier flipped{" "}
                  {AAPL_DIVIDEND.exDateUtc.toISOString().slice(0, 10)} 00:30 UTC
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-hair bg-paper">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
            <Reveal from="left">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
                  How it works
                </p>
                <h2 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl">
                  Three steps. Then it runs.
                </h2>
              </div>
            </Reveal>

            <div>
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.1}>
                  <div className="grid gap-3 border-t-2 border-hair py-8 sm:grid-cols-[5rem_1fr] sm:gap-10">
                    <span className="font-mono text-sm text-money-deep tabular">
                      {s.n}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-medium text-ink">
                        {s.title}
                      </h3>
                      <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-sub">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal from="scale" delay={0.15} className="mx-auto mt-16 max-w-3xl">
            <div>
              <BrowserMock />
              <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                <span className="text-money-deep">●</span> The guard, at work
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-money text-white">
        <Wave fill="text-paper" />
        <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-medium tracking-tight text-white sm:text-5xl">
              Start a plan in under a minute.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mx-auto mt-4 max-w-md text-pretty text-base text-white/85 sm:text-lg">
              Create a plan, connect a wallet, and let the guard do the timing.
              Cancel any time.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <ButtonLink
                href="/create"
                variant="ink"
                size="lg"
                className="w-full sm:w-auto"
              >
                Create a plan
              </ButtonLink>
              <ButtonLink
                href="/dashboard"
                variant="paper"
                size="lg"
                className="w-full sm:w-auto"
              >
                See a live plan
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.16em] text-white/70">
              Your wallet holds the keys. The program never swaps.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  prefix,
  suffix,
  decimals,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-sub">
        {label}
      </p>
      <p className="mt-1 font-mono text-4xl font-semibold text-ink tabular sm:text-5xl">
        <CountUp
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
      </p>
    </div>
  );
}