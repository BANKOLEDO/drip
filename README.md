# Drip

**Set-and-forget DCA into real US stocks that pauses exactly when it must.**

Recurring auto-investing in tokenized stocks (Backed xStocks) on Solana that handles dividends, splits, and weekend premium traps. Built for the [Stocklana](https://stocklana.com) hackathon — Solana's tokenized-stocks sprint.

## One-line pitch

Set a plan: buy $20 of AAPLx every Monday, $50 of NVDAx biweekly, cap any quote at 3% above fair. Drip schedules the buys, checks the life of the trade on-chain, and skips a leg only when it must — on the dividend multiplier flip (00:30 UTC the day after an ex-date) or when the weekend premium spikes beyond your cap.

## Why this is non-generic

Generic DCA bots can't handle ex-dates: a tokenized stock's share price resets at 00:30 UTC the day after a dividend, so a naive autopilot buys at the inflated pre-cut price and takes the loss. Drip:

- **Pauses on dividend cuts** — watches Backed's corporate-action feed and pauses the next leg around the 00:30 UTC multiplier flip, so you never buy the top right before the reset.
- **Guards weekend premium** — compares the Jupiter quote to a live fair price; if the premium exceeds your plan cap, the leg defers instead of overpaying.
- **Accounts for every cent** — every fill is stored as raw shares **plus** scaled shares using the mint's on-chain multiplier (Token-2022 scaled-ui-amount extension), so scaled-value history survives the multiplier flips.

Non-generic proof: nobody in Stocklana has bundled pause-on-ex-date + premium guard + scaled-amount accounting.

## What's live today

| Piece | Status |
|---|---|
| Web app (Next.js 16) | Running — landing, plan creation, dashboard, plan detail |
| On-chain Drip program | **Deployed & live** on devnet (`8beC3twEfuHXr5nhVVmbakLdsLqdKShSWQoPhbb5mHMU`), proven with real `initialize_intent` + `record_fill` transactions and a rejected over-cap leg |
| Fair price | Kraken public `Ticker` API (real AAPLxUSD data) |
| Corporate actions | Backed `api.backed.fi` feed (multiplier + corporate-action history) |
| Swaps | Jupiter Swap V2 — user-signed, keeper never swaps |
| Keeper | Browser `setInterval` gating loop for the demo |

## Architecture

```
user (browser)
  ├─ Next.js app (connect wallet, pick stock, set amount/interval/cap)
  ├─ keeper.js (gating-app loop: polls Backed + fair price + Jupiter quote)
  ├─ Jupiter Swap V2 user-sign /order + /execute (buy)
  └─ Drip program (Anchor PDA `dca_intent`: mint, USDC/round, interval, maxPremiumBps, paused)
```

The program NEVER swaps and NEVER holds custody. It is accounting + guard: a `dca_intent` PDA that records fills, a `paused` flag flipped around multiplier windows, and a premium cap. Swaps are user-signed through Jupiter; the keeper is a dapp-level convenience, not a trust anchor.

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

- `initialize_intent` — open a plan (amount, interval 1/7/14d, premium cap).
- `set_paused` — keeper flips the guard around the 00:30 UTC window.
- `record_fill` — owner-signed receipt; fails while paused or above cap; multiplier must match the on-chain Token-2022 extension within 0.1%.
- `update_plan` / `close_intent` — manage the plan.
- All math checked u64 raw with `MULT_SCALE = 1e9` fixed point.

Deploy checklist in `program/README.md`.

## License

MIT — see [LICENSE](./LICENSE).