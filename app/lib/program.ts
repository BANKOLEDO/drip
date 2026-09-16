// On-chain Drip program plumbing (hand-rolled, no anchor client).
// Accounting + guard only: intent PDA, pause flag, scaled receipts.
// record_fill args mirror programs/drip/src/lib.rs byte-for-byte.
//
// DcaIntent, 118 bytes:
//   8 discriminator | 32 owner | 32 mint | 8 amount_usdc | 2 interval_days |
//   2 max_premium_bps | 1 paused | 1 bump | 8 fills | 8 total_raw |
//   8 total_scaled | 8 created_at
//
// record_fill args: 8 discriminator | 8 raw_shares | 8 multiplier_scaled |
//   2 quote_bps_over_fair

import {
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { STOCKS, type StockSymbol } from "./tokens";

// Must match MULT_SCALE in programs/drip/src/lib.rs.
const MULT_SCALE = 1_000_000_000;

export const DRIP_PROGRAM_ID =
  process.env.NEXT_PUBLIC_DRIP_PROGRAM_ID ?? "";

export function dripProgramId(): PublicKey | null {
  if (!DRIP_PROGRAM_ID) return null;
  try {
    return new PublicKey(DRIP_PROGRAM_ID);
  } catch {
    return null;
  }
}

export function intentPda(
  owner: PublicKey,
  symbol: StockSymbol,
  programId: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      new TextEncoder().encode("dca-intent"),
      owner.toBytes(),
      new PublicKey(STOCKS[symbol].mint).toBytes(),
    ],
    programId,
  );
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// record_fill discriminator: sha256("global:record_fill")[0..8] = 6feeb75249a8977d
const RECORD_FILL_DISC = "6feeb75249a8977d";

export function recordFillInstruction(
  programId: PublicKey,
  intent: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  rawSharesBaseUnits: bigint,
  multiplierFloat: number,
  quoteBpsOverFair: number,
): TransactionInstruction {
  const data = new Uint8Array(8 + 8 + 8 + 2);
  data.set(hexToBytes(RECORD_FILL_DISC), 0);
  const view = new DataView(data.buffer);
  view.setBigUint64(8, rawSharesBaseUnits, true);
  view.setBigUint64(16, BigInt(Math.round(multiplierFloat * MULT_SCALE)), true);
  view.setUint16(24, quoteBpsOverFair, true);
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: intent, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
    ],
    // web3.js v1 types Buffer; Next polyfills it on the client.
    data: Buffer.from(data),
  });
}
