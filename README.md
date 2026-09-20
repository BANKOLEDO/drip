# Drip

**Set-and-forget DCA into real US stocks that pauses exactly when it must.**

Recurring auto-investing in tokenized stocks (xStocks, PreStocks, T-Tokens) on Solana that handles dividends, splits, and weekend price traps. Built for the [Stocklana](https://stocklana.com) hackathon — Solana's tokenized-stocks sprint.

## One-line pitch

Set a plan: buy $20 of AAPLx every Monday, $50 of NVDAx biweekly, cap any quote at 3% above fair. Drip schedules the buys, checks the life of the trade on-chain, and skips a leg only when it must — on the dividend multiplier flip (00:30 UTC the day after an ex-date) or when the weekend premium spikes beyond your cap.

## Why this is non-generic

Generic DCA bots can't handle ex-dates: a tokenized stock's share price resets at 00:30 UTC the day after a dividend, so a naive schedule buys at the inflated pre-cut price and takes the loss. Drip:

- **Pauses on dividend cuts** — watches Backed's corporate-action feed and pauses the next leg around the 00:30 UTC multiplier flip, so you never buy the top right before the reset.
- **Guards weekend price gaps** — compares the Jupiter quote to a live fair price; if the quote runs past your plan cap, the leg defers instead of overpaying.
- **Accounts for every cent** — every fill is stored as raw shares **plus** scaled shares using the mint's on-chain multiplier (Token-2022 scaled-ui-amount extension), so scaled-value history survives the multiplier flips.

Non-generic proof: nobody in Stocklana has bundled pause-on-ex-date + price guard + scaled-amount accounting.

## What's live today

| Piece | Status |
|---|---|
| Web app (Next.js 16) | Running — landing, plan creation, dashboard, plan detail |
| On-chain Drip program | **Deployed & live** on devnet (`8beC3twEfuHXr5nhVVmbakLdsLqdKShSWQoPhbb5mHMU`), proven with real `initialize_intent` + `record_fill` transactions and a rejected over-cap leg |
| Fair price | Pyth first, Kraken second, Yahoo third (public); same-origin proxy for PreStocks/Tessera |
| Corporate actions | Backed `api.backed.fi` feed (multiplier + corporate-action history) |
| Swaps | Jupiter Swap V2 — user-signed, keeper never swaps |
| Keeper | Browser `setInterval` gating loop for the demo; fail-closed (stale data pauses, deferrals hold to 80% of cap) |
| Modes | Demo (instant scripted market, wallet off) and Live (real feeds), toggled in the header |
| Plans | Browser-stored with random UUIDs; demo seeds a showcase plan |

## Architecture

```
user (browser)
  ├─ Next.js app (connect wallet, pick stock, set amount/interval/cap)
  ├─ keeper.js (gating-app loop: polls Backed + fair price + Jupiter quote)
  ├─ Jupiter Swap V2 user-sign /order + /execute (buy)
  └─ Drip program (Anchor PDA `dca_intent`: mint, USDC/round, interval, maxPremiumBps, paused)
```

The program NEVER swaps and NEVER holds custody. It is accounting + guard: a `dca_intent` PDA that records fills, a `paused` flag flipped around multiplier windows, and a price cap. Swaps are user-signed through Jupiter; the keeper is a dapp-level convenience, not a trust anchor.

## Getting started

```bash
# program (Rust + Anchor 1.2.0 + Solana)
cd program
cargo test                              # math tests: AAPL scale, overflow, tolerance

# web (pnpm 10)
cd app
pnpm install
pnpm dev                                # http://localhost:3000
npx tsc --noEmit                        # typecheck
npx eslint . --max-warnings 0           # lint
pnpm build                              # production build
```

Set `app/.env.local`:

```
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_DRIP_PROGRAM_ID=8beC3twEfuHXr5nhVVmbakLdsLqdKShSWQoPhbb5mHMU
```

Until the program ID is set, the plan page shows "On-chain receipts activate after the Drip program deploys" and everything else works (guard-checked Jupiter buys still execute; only the receipt write waits).

## On-chain program

`program/programs/drip/src/lib.rs` — Anchor v1.2.0, Token-2022 scaled-UI aware.

- `initialize_intent` — open a plan (amount, interval 1/7/14d, price cap).
- `set_paused` — keeper flips the guard around the 00:30 UTC window.
- `record_fill` — owner-signed receipt; fails while paused or above cap; multiplier must match the on-chain Token-2022 extension within 0.1%.
- `update_plan` / `close_intent` — manage the plan.
- All math checked u64 raw with `MULT_SCALE = 1e9` fixed point.

Deploy checklist in `program/README.md`.

## Built on

Drip integrates four sponsor ecosystems end to end:

- **Pyth** — server-side Hermes proxy (`app/app/api/pyth/route.ts`) keeps
  the API key out of the browser. Staleness (15 min) and confidence (1%)
  gating; null falls back to Kraken/Yahoo. Feed IDs in `app/lib/pyth.ts`.
- **PreStocks** — 8-asset pre-IPO universe with verified mints and 9-decimal
  handling, mark prices via the keyless same-origin proxy
  (`app/app/api/market/route.ts`).
- **Tessera** — 3-asset community-token universe, same proxy path and
  per-mint decimals.
- **Jupiter** — user-signed Swap V2 execution; quote-only order calls for
  the guard's on-chain price.

Try it: flip the Demo/Live toggle in the header, watch the guard defer an
over-cap PreStocks quote, then clear a public one.

## Testing

```
cd program && cargo test    # 3 passed: dividend scaling, tolerance band, overflow
cd app && npx tsc --noEmit  # clean
cd app && npx eslint . --max-warnings 0
cd app && pnpm build        # green
```

## Judging verification (3 minutes, Demo mode on)

1. Open `/` — flip the header toggle to **Demo**, watch the guard refuse
   SPACEx (black spike) and clear AAPLx (green).
2. Create a plan (`/create`) — any stock, $50 weekly. Land on its page.
3. On the plan page, run the order ticket: review, then the demo fill.
4. Open `/dashboard` — portfolio total grew, your fill tops activity.
5. Revisit any plan later: pauses and waits land in its guard log.

## Security notes

- Non-custodial: the program never swaps or holds funds; every buy is
  user-signed. A wrong guard call costs at most one capped buy, never debt.
- Fail-closed: stale prices pause instead of buying; deferrals hold to 80%
  of cap; demo fills never touch chain.
- Unaudited hackathon software on devnet. Nothing here is financial advice.

## Team

Bankole David (Nigeria) — design, program, frontend, keeper. Solo founder,
building for the users locked out of US brokerages.

## License

MIT — see [LICENSE](./LICENSE).