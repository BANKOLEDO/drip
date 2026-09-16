import { ScaledReceipt } from "@/components/guard/scaled-receipt";
import { LivePremiumFeed } from "@/components/guard/live-premium-feed";
import { GuardStudio } from "@/components/guard/guard-studio";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CornerMark } from "@/components/ui/corner-mark";
import { DripSeparator } from "@/components/ui/drip-separator";
import { Reveal } from "@/components/motion/reveal";
import { StockAvatar } from "@/components/stock-avatar";
import { LiveTickTape } from "@/components/market/live-tick-tape";
import { ButtonLink } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { AAPL_DIVIDEND } from "@/lib/tokens";
import { MULTIPLIER_AAPL } from "@/lib/mock";
import { STOCKS, CATEGORY_LABEL, type StockSymbol, type AssetCategory } from "@/lib/tokens";

const proof = {
  raw: 0.9874123,
  multiplier: MULTIPLIER_AAPL,
  scaled: 0.9874123 * MULTIPLIER_AAPL,
};

const assetGroups: { category: AssetCategory; symbols: StockSymbol[] }[] = [
  { category: "public", symbols: ["AAPLx", "NVDAx", "TSLAx", "SPYx", "MSFTx", "GOOGLx", "AMZNx", "METAx", "QQQx", "HOODx"] },
  { category: "prestocks", symbols: ["SPACEx", "OPENAIx", "ANTHROPICx", "NEURALINKx", "KALSHIx", "POLYMARKETx", "FIGUREAIx", "ANDURILx"] },
  { category: "tessera", symbols: ["T-OpenAI", "T-Kalshi", "T-SpaceX"] },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero: full-viewport instrument panel */}
      <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col overflow-hidden border-b border-hair">
        {/* Ground: ruled paper under everything */}
        <div aria-hidden className="absolute inset-0 paper-ruled" />
        {/* Left edge ruler scale */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-12 lg:block"
        >
          <div className="ruler-scale w-12 text-money/15" />
        </div>
        {/* Secondary stripe pattern, low and dead-centre of the copy side */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-1/4 hidden h-64 w-64 rotate-45 pattern-stripes opacity-30 lg:block"
        />

        <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-end gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          {/* Text first everywhere; left-aligned on desktop, centered below */}
          <div className="order-1 text-center lg:order-1 lg:text-left">
            <Reveal>
              <p className="flex items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-[0.24em] text-money-deep lg:justify-start">
                <Image
                  src="/assets/solana-mark.svg"
                  alt="Solana"
                  width={16}
                  height={14}
                  className="h-3.5 w-auto shrink-0"
                />
                Solana · live demo
              </p>
              <h1 className="mx-auto mt-4 max-w-[16ch] text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:mx-0 lg:max-w-[14ch] lg:text-7xl">
                Drip. Buy a little, on a schedule.
                <span className="block text-money">And know when not to buy.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-sub sm:text-lg lg:mx-0 lg:text-xl">
                You pick a stock, like Apple or NVIDIA, and how much to put
                in each week. Drip buys a little of it automatically. Except
                when the price is wrong.
              </p>
            </Reveal>
            <Reveal delay={0.16}>
            <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-white/10 bg-night px-1.5 py-1 shadow-lg lg:mx-0">
              <Link
                href="/create"
                className="rounded-full bg-paper px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-night"
              >
                Create a plan
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-night-muted transition-colors hover:text-paper"
              >
                Watch it live
              </Link>
            </div>
            <p className="mt-4 font-mono text-xs tabular text-sub">
              21 assets · 3 markets · no account needed
            </p>
            </Reveal>
          </div>

          <div className="order-2 lg:order-2">
            <Reveal once delay={0.1}>
            <div className="relative">
                {/* Corner registration marks: the instrument is mounted here */}
              <div
                aria-hidden
                className="absolute -left-2 -top-2 hidden h-4 w-4 border-l-2 border-t-2 border-money/40 lg:block"
              />
              <div
                aria-hidden
                className="absolute -right-2 -top-2 hidden h-4 w-4 border-r-2 border-t-2 border-money/40 lg:block"
              />
              <div
                aria-hidden
                className="absolute -bottom-2 -left-2 hidden h-4 w-4 border-b-2 border-l-2 border-money/40 lg:block"
              />
              <div
                aria-hidden
                className="absolute -bottom-2 -right-2 hidden h-4 w-4 border-b-2 border-r-2 border-money/40 lg:block"
              />
              <p className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                <span>Guard · AAPLx</span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-leaf" />
                  </span>
                  live
                </span>
              </p>
              <LivePremiumFeed
                symbol="AAPLx"
                amountUsdc={50}
                className="border-0 bg-transparent rounded-none"
              />
            </div>
            </Reveal>
          </div>
        </div>

        {/* Drips landing on the market tape: the brand in action */}
        <div
          aria-hidden
          className="relative mt-auto pointer-events-none"
        >
          <div className="absolute inset-x-0 -top-6 h-6 pattern-drips opacity-[0.22] sm:-top-8 sm:h-8" />
          <LiveTickTape />
        </div>
      </section>

      {/* Problem → solution, plain words */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20">
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            <div className="relative overflow-hidden border border-hair bg-card p-5 sm:p-6">
              <CornerMark className="-top-[6px] -left-[6px]" />
              <CornerMark className="-top-[6px] -right-[6px]" />
              <CornerMark className="-bottom-[6px] -left-[6px]" />
              <CornerMark className="-bottom-[6px] -right-[6px]" />
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-danger">
                The problem
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                Schedules buy blind.
              </h2>
              <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-sub">
                Here&apos;s what goes wrong with buying on a schedule. When
                Apple paid its dividend, every share changed value
                overnight, so anyone who bought before the flip paid the
                old price. On quiet weekends, the price in the app can
                drift far from the real one. A schedule that can&apos;t see
                those moments keeps buying at the wrong price.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub">
                  +0.0605% overnight
                </span>
                <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub">
                  5x quote gaps
                </span>
              </div>
            </div>
            <div className="relative overflow-hidden bg-night p-5 sm:p-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-leaf-bright">
                The fix
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-paper">
                Drip looks first.
              </h2>
              <p className="mt-2 max-w-lg text-pretty text-sm leading-relaxed text-night-muted">
                Drip checks the real-world price before every buy and pauses
                around dividend flips. Wrong price? The buy waits for the
                next window instead of overpaying. Every fill carries a
                receipt, raw shares times scaled, that anyone can check at
                any time. The schedule keeps running and your money only
                moves when the price is right.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-md border border-dashed border-white/20 px-2 py-0.5 font-mono text-[11px] text-night-muted">
                  checks price
                </span>
                <span className="inline-flex items-center rounded-md border border-dashed border-white/20 px-2 py-0.5 font-mono text-[11px] text-night-muted">
                  pauses on flips
                </span>
                <span className="inline-flex items-center rounded-md border border-dashed border-white/20 px-2 py-0.5 font-mono text-[11px] text-night-muted">
                  receipts fills
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* The instrument: the live guard studio */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Reveal once>
          <GuardStudio />
        </Reveal>
      </section>

      {/* How it works: the wallet cliff, answered in three steps */}
      <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <Reveal>
          <HowItWorks />
        </Reveal>
      </section>

      {/* The dividend math */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <Reveal>
        <div className="relative overflow-hidden border border-hair bg-card">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />

          <div className="border-b p-5 sm:px-8 sm:py-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
              Scaled receipts
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              The math is on show, not under a hood.
            </h2>
            <p className="mt-2 max-w-2xl text-pretty text-sm text-sub">
              When Apple (AAPLx) paid its dividend, each share was scaled up
              0.0605% so its value stayed exact. Drip shows that scaling on
              every fill, and guards the overnight flip so you never buy the
              wrong side.
            </p>
            <div className="mt-3 flex w-full flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub">
                {AAPL_DIVIDEND.multiplierBefore.toFixed(7)} →{" "}
                {AAPL_DIVIDEND.multiplierAfter.toFixed(7)}
              </span>
              <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub">
                +0.0605% scaled
              </span>
              <span className="inline-flex items-center rounded-md border border-dashed border-hair px-2 py-0.5 font-mono text-[11px] text-sub">
                {AAPL_DIVIDEND.exDateUtc.toISOString().slice(0, 10)} 00:30 UTC
              </span>
            </div>
          </div>

          <div className="border-b p-5 sm:px-8">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
              Raw in, scaled out
            </p>
            <div className="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-[1fr_12px_1fr_12px_1fr]">
              <div className="rounded-[3px] border border-dashed border-hair bg-paper px-3 py-2.5">
                <p className="text-xs font-semibold text-ink">Your buy</p>
                <p className="mt-0.5 font-mono text-sm text-sub tabular">
                  {proof.raw.toFixed(7)} shares
                </p>
              </div>
              <div aria-hidden className="my-auto hidden h-px w-full bg-hair sm:block" />
              <div className="rounded-[3px] border border-dashed border-hair bg-paper px-3 py-2.5">
                <p className="text-xs font-semibold text-ink">Dividend scales it</p>
                <p className="mt-0.5 font-mono text-sm text-sub tabular">
                  {proof.multiplier.toFixed(7)}
                </p>
              </div>
              <div aria-hidden className="my-auto hidden h-px w-full bg-hair sm:block" />
              <div className="rounded-[3px] border border-money bg-money/[0.04] px-3 py-2.5">
                <p className="text-xs font-semibold text-ink">Scaled up</p>
                <p className="mt-0.5 font-mono text-sm text-ink tabular">
                  {proof.scaled.toFixed(7)} · +0.0605%
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="relative border border-hair bg-paper p-4 sm:p-6">
              <CornerMark className="-top-[6px] -left-[6px]" />
              <CornerMark className="-top-[6px] -right-[6px]" />
              <CornerMark className="-bottom-[6px] -left-[6px]" />
              <CornerMark className="-bottom-[6px] -right-[6px]" />
              <ScaledReceipt
                rawShares={proof.raw}
                scaledShares={proof.scaled}
                multiplier={proof.multiplier}
                caption="A dividend scaled your shares up. The receipt proves it."
              />
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      {/* All 21 assets */}
      <section id="assets" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
        <Reveal>
        <div className="relative overflow-hidden border border-hair bg-card">
          <CornerMark className="-top-[6px] -left-[6px]" />
          <CornerMark className="-top-[6px] -right-[6px]" />
          <CornerMark className="-bottom-[6px] -left-[6px]" />
          <CornerMark className="-bottom-[6px] -right-[6px]" />

          <div className="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
                The universe
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
                All 21 assets you can invest in.
              </h2>
              <p className="mt-1 max-w-xl text-pretty text-[13px] text-sub">
                Apple and NVIDIA (public stocks), SpaceX and OpenAI (pre-IPO
                PreStocks), and community T-Tokens. All on Solana, all on a
                schedule, all guarded by the price check.
              </p>
            </div>
            <span className="inline-flex w-fit shrink-0 items-center rounded-md border border-hair bg-paper px-2 py-0.5 font-mono text-[11px] text-sub">
              {assetGroups.reduce((n, g) => n + g.symbols.length, 0)} assets
            </span>
          </div>

          <div className="grid grid-cols-1 divide-y divide-hair md:grid-cols-3 md:divide-x md:divide-y-0">
            {assetGroups.map((group) => (
              <div key={group.category} className="px-4 py-3 sm:px-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                  {CATEGORY_LABEL[group.category]} · {group.symbols.length}
                </h3>
                <ul className="mt-1 divide-y divide-hair">
                  {group.symbols.map((s) => {
                    const stock = STOCKS[s];
                    return (
                      <li
                        key={s}
                        className="flex items-center justify-between gap-3 py-1.5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <StockAvatar symbol={s} size={18} />
                          <span className="truncate text-[13px] font-medium text-ink">
                            {stock.name}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-sub">
                          {stock.symbol}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {group.category === "tessera" && (
                  <figure className="mx-auto mt-4 w-full max-w-[200px] rotate-[2deg] border border-hair bg-paper p-2 shadow-md">
                    <Image
                      src="/assets/shield-poster.jpg"
                      alt="A shield guarding coins and a bank"
                      width={560}
                      height={560}
                      loading="lazy"
                      className="h-auto w-full"
                    />
                    <figcaption className="px-1 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                      Guarded on every market
                    </figcaption>
                  </figure>
                )}
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      <DripSeparator />

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:pb-16">
        <Reveal>
        <div className="relative overflow-hidden bg-night text-center sm:text-left">
          <div aria-hidden className="h-8 pattern-night-drips opacity-60 sm:h-10" />
          <div className="grid items-center gap-8 px-6 pb-12 pt-6 sm:grid-cols-[1.2fr_240px] sm:pb-16 sm:pt-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-leaf-bright">
                Set it, forget it
              </p>
              <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-paper sm:mx-0 sm:text-5xl">
                Start a plan in under a minute.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-night-muted sm:mx-0">
                Create a plan, connect a wallet, and let the guard do the
                timing.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-start">
                <ButtonLink href="/create" variant="paper" size="lg">
                  Create a plan
                </ButtonLink>
                <ButtonLink href="/dashboard" variant="outline-light" size="lg">
                  See a live plan
                </ButtonLink>
              </div>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-night-muted/70">
                Your money stays in your wallet · pause anytime · receipt for every buy
              </p>
            </div>
            <figure className="relative mx-auto w-full max-w-[240px] rotate-[2deg] border border-white/15 bg-paper p-2 shadow-xl">
              <Image
                src="/assets/growth-poster.jpg"
                alt="Growth chart with coins stacking up"
                width={480}
                height={480}
                loading="lazy"
                className="h-auto w-full"
              />
              <figcaption className="px-1 pb-1 pt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
                Buy a little, often
              </figcaption>
            </figure>
          </div>
        </div>
        </Reveal>
      </section>
    </main>
  );
}