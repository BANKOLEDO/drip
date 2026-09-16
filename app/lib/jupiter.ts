// Jupiter Swap V2 user-signed buys. The program never swaps or holds
// custody. Quote-only calls work keyless; production adds a free key.

import { STOCKS, USDC_MINT, type StockSymbol } from "./tokens";

const JUP_ORDER = "https://api.jup.ag/swap/v2/order";
const JUP_EXECUTE = "https://api.jup.ag/swap/v2/execute";
const TIMEOUT_MS = 15_000;
const USDC_DECIMALS = 6;

export interface BuiltOrder {
  transactionB64: string;
  requestId: string;
}

async function postJson(url: string, body: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Jupiter ${res.status}: ${(await res.text()).slice(0, 160)}`);
  }
  return await res.json();
}

// Build an unsigned buy order: USDC in, xStock out.
export async function buildBuyOrder(
  symbol: StockSymbol,
  amountUsdc: number,
  taker: string,
  slippageBps = 50,
): Promise<BuiltOrder> {
  const json = await postJson(JUP_ORDER, {
    inputMint: USDC_MINT,
    outputMint: STOCKS[symbol].mint,
    amount: String(Math.round(amountUsdc * 10 ** USDC_DECIMALS)),
    taker,
    slippageBps,
  });
  const tx =
    (json as { transaction?: string })?.transaction ??
    (json as { data?: { transaction?: string } })?.data?.transaction;
  const requestId =
    (json as { requestId?: string })?.requestId ??
    (json as { data?: { requestId?: string } })?.data?.requestId;
  if (!tx || !requestId) throw new Error("Jupiter returned no signable order");
  return { transactionB64: tx, requestId };
}

// Submit a wallet-signed order. Returns the on-chain signature.
export async function executeSignedOrder(
  signedB64: string,
  requestId: string,
): Promise<string> {
  const json = await postJson(JUP_EXECUTE, {
    signedTransaction: signedB64,
    requestId,
  });
  const sig =
    (json as { signature?: string })?.signature ??
    (json as { txid?: string })?.txid ??
    (json as { data?: { signature?: string } })?.data?.signature;
  if (!sig) throw new Error("Jupiter returned no signature");
  return sig;
}

// Browser-safe base64 without a Buffer polyfill.
export function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}