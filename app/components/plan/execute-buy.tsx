"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getPremiumSnapshot } from "@/lib/live";
import {
  buildBuyOrder,
  executeSignedOrder,
  b64ToBytes,
  bytesToB64,
} from "@/lib/jupiter";
import {
  dripProgramId,
  intentPda,
  recordFillInstruction,
} from "@/lib/program";
import { MULTIPLIER_AAPL } from "@/lib/mock";
import { STOCKS, type StockSymbol } from "@/lib/tokens";
import { cn } from "@/lib/cn";

// User-signed fill on the plan page. Flow: review (live guard check) → sign
// in wallet → execute through Jupiter → explorer link. The guard blocks the
// review step when premium is over cap, so the program's rule holds at the UI
// edge too.

type Phase =
  | { name: "idle" }
  | { name: "quoting" }
  | { name: "ready"; shares: number; price: number; bps: number }
  | { name: "signing"; shares: number; bps: number }
  | { name: "done"; signature: string; shares: number; bps: number }
  | { name: "error"; message: string };

export function ExecuteBuy({
  symbol,
  amountUsdc,
  maxPremiumBps,
}: {
  symbol: StockSymbol;
  amountUsdc: number;
  maxPremiumBps: number;
}) {
  const { connected, publicKey, signTransaction } = useWallet();
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const cluster =
    process.env.NEXT_PUBLIC_NETWORK === "mainnet" ? "mainnet-beta" : "devnet";

  const review = async () => {
    setPhase({ name: "quoting" });
    try {
      const snap = await getPremiumSnapshot(symbol, amountUsdc, maxPremiumBps);
      if (!snap) {
        setPhase({
          name: "error",
          message: "No live quote right now. Try again in a minute.",
        });
        return;
      }
      if (snap.quoteBpsOverFair > maxPremiumBps) {
        setPhase({
          name: "error",
          message: `Guard blocks this buy: quote ${snap.quoteBpsOverFair} bps over fair, cap ${maxPremiumBps} bps.`,
        });
        return;
      }
      setPhase({
        name: "ready",
        shares: amountUsdc / snap.quoteUsd,
        price: snap.quoteUsd,
        bps: snap.quoteBpsOverFair,
      });
    } catch {
      setPhase({ name: "error", message: "Quote failed. Try again in a minute." });
    }
  };

  const execute = async () => {
    if (!publicKey || !signTransaction || phase.name !== "ready") return;
    const { shares, bps } = phase;
    setPhase({ name: "signing", shares, bps });
    try {
      const order = await buildBuyOrder(
        symbol,
        amountUsdc,
        publicKey.toBase58(),
      );
      const tx = VersionedTransaction.deserialize(b64ToBytes(order.transactionB64));
      const signed = await signTransaction(tx);
      const signature = await executeSignedOrder(
        bytesToB64(signed.serialize()),
        order.requestId,
      );
      setPhase({ name: "done", signature, shares, bps });
    } catch (e) {
      setPhase({
        name: "error",
        message: e instanceof Error ? e.message.slice(0, 160) : "Swap failed.",
      });
    }
  };

  if (!connected) {
    return (
      <p className="text-sm text-sub">
        Connect a wallet above to execute this plan&apos;s buy.
      </p>
    );
  }

  if (phase.name === "done") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-ink">
          Bought.{" "}
          <a
            href={`https://explorer.solana.com/tx/${phase.signature}?cluster=${cluster}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs text-money-deep underline underline-offset-2"
          >
            View on Solana Explorer
          </a>
        </p>
        <RecordReceipt
          symbol={symbol}
          sharesFloat={phase.shares}
          quoteBpsOverFair={phase.bps}
          cluster={cluster}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {phase.name === "ready" && (
        <p className="font-mono text-xs tabular text-sub">
          ~{phase.shares.toFixed(4)} {symbol} @ ${phase.price.toFixed(2)} · +
          {phase.bps} bps
        </p>
      )}
      {phase.name === "error" && (
        <p role="alert" className="text-sm text-amber">
          {phase.message}
        </p>
      )}
      <div>
        {phase.name === "ready" ? (
          <button
            type="button"
            onClick={() => void execute()}
            className={cn(
              "rounded-button bg-money px-4 py-2 text-sm font-semibold text-white",
              "transition-transform duration-150 hover:-translate-y-px active:translate-y-0",
            )}
          >
            Sign &amp; execute buy
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void review()}
            disabled={phase.name === "quoting" || phase.name === "signing"}
            className={cn(
              "rounded-button border border-money/40 px-4 py-2 text-sm font-semibold text-money-deep",
              "transition-colors hover:bg-money/10 disabled:opacity-50",
            )}
          >
            {phase.name === "quoting"
              ? "Checking guard…"
              : phase.name === "signing"
                ? "Waiting for signature…"
                : "Review buy"}
          </button>
        )}
      </div>
    </div>
  );
}

// Second signature: write the scaled receipt to the Drip program. Degrades
// to an explanatory note until NEXT_PUBLIC_DRIP_PROGRAM_ID is deployed.
function RecordReceipt({
  symbol,
  sharesFloat,
  quoteBpsOverFair,
  cluster,
}: {
  symbol: StockSymbol;
  sharesFloat: number;
  quoteBpsOverFair: number;
  cluster: string;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [state, setState] = useState<
    { name: "idle" } | { name: "sending" } | { name: "done"; signature: string } | { name: "error"; message: string }
  >({ name: "idle" });

  const programId = dripProgramId();
  if (!programId || !publicKey) {
    return (
      <p className="font-mono text-xs text-sub">
        On-chain receipts activate after the Drip program deploys.
      </p>
    );
  }

  const record = async () => {
    setState({ name: "sending" });
    try {
      const [intent] = intentPda(publicKey, symbol, programId);
      const ix = recordFillInstruction(
        programId,
        intent,
        publicKey,
        new PublicKey(STOCKS[symbol].mint),
        BigInt(Math.round(sharesFloat * 10 ** 8)),
        MULTIPLIER_AAPL,
        quoteBpsOverFair,
      );
      const tx = new Transaction().add(ix);
      const signature = await sendTransaction(tx, connection);
      setState({ name: "done", signature });
    } catch (e) {
      setState({
        name: "error",
        message: e instanceof Error ? e.message.slice(0, 160) : "Receipt failed.",
      });
    }
  };

  if (state.name === "done") {
    return (
      <p className="text-sm text-ink">
        Receipt recorded.{" "}
        <a
          href={`https://explorer.solana.com/tx/${state.signature}?cluster=${cluster}`}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-xs text-money-deep underline underline-offset-2"
        >
          View receipt
        </a>
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {state.name === "error" && (
        <p role="alert" className="text-sm text-amber">
          {state.message}
        </p>
      )}
      <div>
        <button
          type="button"
          onClick={() => void record()}
          disabled={state.name === "sending"}
          className="rounded-button border border-money/40 px-4 py-2 text-sm font-semibold text-money-deep transition-colors hover:bg-money/10 disabled:opacity-50"
        >
          {state.name === "sending" ? "Recording…" : "Record on-chain receipt"}
        </button>
      </div>
    </div>
  );
}