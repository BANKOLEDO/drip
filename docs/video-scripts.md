# Drip — Pitch Video & Technical Demo Scripts

Deadline: September 25, 4pm ET. Pool $121K. Tracks: main + Pyth, PreStocks, Tessera, Meteora, Clawpump.

---

## Pitch Video (Max 3:00) — The WHY

### 0:00–0:20 — Who (face to camera)
> "I'm Bankole David, a developer from Nigeria, where you cannot open a US brokerage account. Tokenized stocks changed that. But holding them taught me something nobody warns you about."

### 0:20–0:55 — Problem (screen: xStocks stats + AAPLx chart)
> "Tokenized stocks did $35 billion in volume this year, with 200,000 holders on Solana. And 62% of holders just hold. The problem: scheduled buying is blind. When Apple paid its dividend, every share changed value overnight, so anyone buying before the flip paid the old price. On quiet weekends, app prices drift from real prices. We have measured quotes five times above fair value, live. A schedule that can't see those moments keeps buying at the wrong price."

### 0:55–1:25 — What (screen: landing hero, scroll slowly)
> "Drip is set-and-forget investing with a guard. You pick a stock and an amount each week. Before every buy, Drip checks the real-world price. Too high? It waits. Dividend flipping overnight? It pauses. Every fill carries a receipt anyone can check."

### 1:25–2:05 — Demo beats (screen: app, Demo mode)
1. **Guard studio, PreStocks tab:** black spike, "deferred." Say: "SpaceX is trading five times above its mark. Drip refuses."
2. **Switch to Public:** green, within tolerance. "Apple is fairly priced. This one would fill."
3. **Create a plan:** open it, show the receipt math. "Raw shares times scaled. Provable."

### 2:05–2:30 — Who it's for + validation (face to camera)
> "This is for the passive majority, and for people like me who were never allowed a brokerage account in the first place."
> *(Insert 1–2 real user quotes here. Get them this week. Even informal.)*

### 2:30–2:45 — Vision + ask (face to camera)
> "Today: 21 assets across public stocks, pre-IPO PreStocks, and T-Tokens. Next: Nigerian equities the day xNG ships, and an NGX price oracle nobody has built. Drip for the main track, and the Pyth, PreStocks, and Tessera bounties."

---

## Technical Demo (2–3 min) — The HOW (screen: code + explorer)

1. **Program (0:00–0:40).** Anchor PDA `dca_intent` on devnet `8beC3twEfuHXr5nhVVmbakLdsLqdKShSWQoPhbb5mHMU`. Accounting + guard only: never swaps, never holds funds. Show `initialize_intent` + `record_fill` transactions on the explorer.
2. **Scaled amounts (0:40–1:00).** Token-2022 scaled-ui-amount extension. Raw shares times on-chain multiplier, u64 math. Show the receipt.
3. **Swaps (1:00–1:20).** Jupiter Swap V2, user-signed. Keeper never touches keys. Quote-only order calls, keyless.
4. **Keeper (1:20–2:00).** Show `lib/keeper.ts`: Backed corporate-action feed → 00:30 UTC pause windows; fair chain Pyth → Kraken → Yahoo, proxy for PreStocks/Tessera; per-mint decimals (8 vs 9); hysteresis (defer above cap, resume at 80%); stale data pauses, never buys.
5. **Modes (2:00–2:20).** Demo/Live toggle in the header. Demo: curated instant market, wallet off. Live: real feeds, honest empty states, browser-stored plans with random UUIDs.
6. **Close (2:20–2:30).** "Deterministic by design: same inputs, same verdict, auditable by anyone. The model never touches money."

---

## Shoot Notes

- Phone + quiet room beats studio. Screen-record at 1080p, zoom to 125%.
- Demo mode ON for every take (no spinners, no dead feeds).
- Hard-refresh before recording. Close other tabs.
- Say numbers out loud; judges remember "+0.0605%" and "five times."
- Under 3:00 or it gets cut. Rehearse with a timer twice.
