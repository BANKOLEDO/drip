"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { useMetaMaskReady } from "@/components/wallet/wallet-provider";
import { useMode } from "@/components/mode/mode-context";
import { shortAddress } from "@/lib/wallet";
import { cn } from "@/lib/cn";

const UNSUPPORTED = new Set(["UnsupportedWallet"]);

function WalletLogo({ name, icon }: { name: string; icon: string }) {
  const [broken, setBroken] = useState(false);
  if (broken || !icon) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-money/15 font-semibold text-money-deep">
        {name.slice(0, 1)}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt=""
      width={28}
      height={28}
      onError={() => setBroken(true)}
      className="h-7 w-7 shrink-0 rounded-full object-cover"
    />
  );
}

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
  const { mode } = useMode();
  const pendingRef = useRef<string | null>(null);
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
      // select() only schedules state; connecting in the same tick reads
      // the old wallet and throws WalletNotSelectedError. Park the name
      // and connect once the effect below sees it selected.
      if (wallet?.adapter.name === target.adapter.name) {
        void Promise.resolve(connect())
          .then(() => setOpen(false))
          .catch(() => undefined)
          .finally(() => setBusy(null));
        return;
      }
      pendingRef.current = target.adapter.name;
      select(target.adapter.name);
    },
    [connect, select, wallet],
  );

  useEffect(() => {
    if (pendingRef.current && wallet?.adapter.name === pendingRef.current) {
      pendingRef.current = null;
      void Promise.resolve(connect())
        .then(() => setOpen(false))
        .catch(() => undefined)
        .finally(() => setBusy(null));
    }
  }, [wallet, connect]);

  const handlePrimary = useCallback(() => {
    if (connecting || disconnecting) return;
    if (connected) {
      setOpen((o) => !o);
      return;
    }
    if (mmReady) setOpen(true);
    else window.setTimeout(() => setOpen(true), 1200);
  }, [connected, connecting, disconnecting, mmReady]);

  // Some wallets never emit events on external logout, so resync on
  // focus/visibility plus the disconnect event. Otherwise the old address
  // stays on screen until refresh.
  useEffect(() => {
    const adapter = wallet?.adapter;
    if (!adapter) return;
    const resync = () => {
      if (connected && !adapter.connected) void disconnect();
    };
    adapter.on("disconnect", resync);
    window.addEventListener("focus", resync);
    document.addEventListener("visibilitychange", resync);
    return () => {
      adapter.off("disconnect", resync);
      window.removeEventListener("focus", resync);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [connected, wallet, disconnect]);

  const [copied, setCopied] = useState(false);
  const copyAddress = useCallback(() => {
    if (!publicKey) return;
    void navigator.clipboard
      ?.writeText(publicKey.toBase58())
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  }, [publicKey]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {mode === "demo" ? (
        <button
          type="button"
          disabled
          title="Wallet is off in demo mode. Switch to Live to connect."
          className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-control border border-dashed border-hair bg-transparent px-3 text-sm font-medium text-sub/60"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sub/40" />
          Wallet off in demo
        </button>
      ) : (
      <>
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
        title={connected ? "Account" : "Connect wallet"}
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

      {open && connected && publicKey && (
        <div className="animate-fade-lift absolute right-0 top-full z-40 mt-2 w-80 rounded-card border border-hair bg-card p-2 shadow-lg shadow-ink/5">
          <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-sub">
              {wallet?.adapter.name ?? "Wallet"}
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
          <button
            type="button"
            onClick={copyAddress}
            title="Copy address"
            className="flex w-full items-center justify-between gap-3 rounded-control border border-dashed border-hair bg-paper px-3 py-2.5 text-left transition-colors hover:border-sub"
          >
            <span className="truncate font-mono text-sm text-ink tabular">
              {publicKey.toBase58()}
            </span>
            <span className="shrink-0 font-mono text-xs text-sub">
              {copied ? "Copied" : "Copy"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void disconnect();
            }}
            className="mt-1 flex w-full items-center rounded-control px-3 py-2.5 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10"
          >
            Log out
          </button>
        </div>
      )}

      {open && !connected && (
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
                      <WalletLogo name={w.adapter.name} icon={w.adapter.icon} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">
                          {w.adapter.name}
                        </span>
                        {notDetected && (
                          <span className="block text-xs text-sub">
                            Not installed, open to download
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
      </>
      )}
    </div>
  );
}