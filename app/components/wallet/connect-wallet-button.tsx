"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useMetaMaskReady } from "@/components/wallet/wallet-provider";
import { shortAddress } from "@/lib/wallet";
import { cn } from "@/lib/cn";

const UNSUPPORTED = new Set(["UnsupportedWallet"]);

export function ConnectWalletButton({ className }: { className?: string }) {
  const {
    wallets,
    select,
    connect,
    connected,
    connecting,
    disconnecting,
    publicKey,
    wallet,
    disconnect,
  } = useWallet();
  const mmReady = useMetaMaskReady();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const installed = useMemo(
    () =>
      wallets.filter(
        (w) =>
          !UNSUPPORTED.has(w.adapter.name) &&
          w.adapter.name !== "Solana Mobile Wallet",
      ),
    [wallets],
  );

  const connectTo = useCallback(
    (target: (typeof wallets)[number]) => {
      setBusy(target.adapter.name);
      if (target.adapter.readyState === WalletReadyState.NotDetected) {
        // Wallet Standard adapter present but the extension is missing.
        if (target.adapter.url) window.open(target.adapter.url, "_blank", "noopener");
        setBusy(null);
        return;
      }
      select(target.adapter.name);
      void Promise.resolve(connect())
        .then(() => setOpen(false))
        .catch(() => undefined)
        .finally(() => setBusy(null));
    },
    [connect, select],
  );

  const handlePrimary = useCallback(() => {
    if (connected || connecting || disconnecting) {
      void disconnect();
      return;
    }
    if (mmReady) setOpen(true);
    else window.setTimeout(() => setOpen(true), 1200);
  }, [connected, connecting, disconnecting, disconnect, mmReady]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handlePrimary}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors",
          connected
            ? "border border-money/30 bg-money/[0.06] text-money-deep hover:border-money/50"
            : "bg-money text-white hover:bg-money-hover",
          (connecting || disconnecting) && "opacity-60",
        )}
        title={connected ? "Disconnect" : "Connect wallet"}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            connected ? "bg-money" : "bg-white/80",
          )}
        />
        {connected && publicKey
          ? `${wallet?.adapter.name ?? "Wallet"} · ${shortAddress(publicKey.toBase58())}`
          : connecting || disconnecting
            ? "Connecting…"
            : "Connect wallet"}
      </button>

      {open && (
        <div className="animate-fade-lift absolute right-0 top-full z-40 mt-2 w-80 rounded-card border border-hair bg-card p-2 shadow-lg shadow-ink/5">
          <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              Connect wallet
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sub transition-colors hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {installed.length === 0 ? (
            <div className="px-3 pb-4 pt-2 text-sm leading-relaxed text-sub">
              No Solana wallet detected. Install Phantom, Solflare or Backpack,
              or enable Solana in your MetaMask (Settings → Networks → Solana),
              then refresh.
            </div>
          ) : (
            <ul className="flex flex-col gap-1 pb-1">
              {installed.map((w) => {
                const notDetected =
                  w.adapter.readyState === WalletReadyState.NotDetected;
                return (
                  <li key={w.adapter.name}>
                    <button
                      type="button"
                      disabled={busy === w.adapter.name}
                      onClick={() => connectTo(w)}
                      className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left transition-colors hover:bg-paper disabled:opacity-60"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-money/15 font-semibold text-money-deep">
                        {w.adapter.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {w.adapter.name}
                        </span>
                        {notDetected && (
                          <span className="block text-xs text-sub">
                            Not installed — open to download
                          </span>
                        )}
                      </span>
                      {busy === w.adapter.name ? (
                        <span className="text-xs text-sub">Connecting…</span>
                      ) : notDetected ? (
                        <span className="text-xs text-sub">↓</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {!mmReady && (
            <p className="px-3 pb-2 pt-1 text-xs text-sub">
              Scanning for MetaMask…
            </p>
          )}
        </div>
      )}
    </div>
  );
}