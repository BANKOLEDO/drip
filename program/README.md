# Drip program — deploy checklist

The program is accounting + guard only. It never swaps, never holds custody.

## 1. Toolchain (one-time, on a machine with Rust)

```sh
# Rust + Solana + Anchor 1.2.0 (AGENTS.md pins Anchor v1.2.0)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 1.2.0 && avm use 1.2.0
solana-keygen new -o ~/.config/solana/id.json
solana config set --url devnet
solana airdrop 2
```

## 2. Program id

```sh
cd program
anchor keys list        # copy the address into declare_id! in lib.rs
anchor keys sync        # syncs Anchor.toml + lib.rs
```

## 3. Build, test, deploy (devnet)

```sh
cargo test               # pure-math tests: AAPL scale, overflow, tolerance
anchor build
anchor deploy --provider.cluster devnet
```

## 4. Wire the frontend

```sh
# in app/.env.local
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_DRIP_PROGRAM_ID=<deployed address>
```

Until the env var is set, the plan page shows "On-chain receipts activate
after the Drip program deploys" and everything else works (guard-checked
Jupiter buys still execute; only the receipt write waits).

## What the program enforces on-chain

- `record_fill` fails while `paused` (keeper flips via `set_paused`
  around the 00:30 UTC window) and when premium exceeds the plan cap.
- Multiplier is fixed-point u64 (1e9 scale); all math checked u64 raw.
- When the mint carries the Token-2022 scaled-ui-amount extension, the
  provided multiplier must agree with
  `StateWithExtensions::get_extension::<ScaledUiAmountConfig>()` within
  0.1%, otherwise `MultiplierMismatch`. Plain-SPL/test mints skip the check.
