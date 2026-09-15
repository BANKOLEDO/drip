"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { cn } from "@/lib/cn";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create", label: "New plan" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function navigate() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-20">
      <div className="h-1 bg-money" />
      <div className="border-b border-hair bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Drip home"
            className="flex shrink-0 items-center gap-2"
          >
            <Logo />
            <span className="hidden items-center gap-1.5 border-l border-hair pl-3 font-mono text-[11px] uppercase tracking-[0.18em] text-sub lg:inline-flex">
              DCA · Solana
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => {
              const active =
                pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={navigate}
                  className={cn(
                    "group relative py-1.5 text-sm transition-colors",
                    active
                      ? "font-medium text-ink"
                      : "text-sub hover:text-ink",
                  )}
                >
                  {l.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full transition-opacity",
                      active ? "bg-money" : "opacity-0 group-hover:opacity-40",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ConnectWalletButton className="hidden lg:inline-flex" />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-control border border-hair text-ink md:hidden"
            >
              <span className="flex flex-col gap-1.5">
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-current transition-transform",
                    open && "translate-y-2 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "block h-0.5 w-5 bg-current transition-transform",
                    open && "-translate-y-0.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
        <div aria-hidden className="ruler-scale h-2 text-money/60" />
      </div>
      {open && (
        <div className="animate-collapse-down fixed inset-0 top-16 z-10 border-t border-hair bg-paper md:hidden">
          <nav className="flex max-h-dvh flex-col overflow-y-auto px-6 pt-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={navigate}
                className="border-b border-hair py-5 font-display text-4xl font-medium tracking-tight text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 py-6">
            <ConnectWalletButton className="w-full justify-center" />
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-night text-night-muted">
      <div className="absolute inset-x-0 top-0 h-1 bg-money" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" aria-label="Drip home" className="text-paper">
            <Logo className="[&_span]:text-paper" />
          </Link>
          <p className="max-w-xs text-sm leading-relaxed">
            Recurring DCA into tokenized US equities on Solana, with a guard
            that knows when not to buy.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-night-muted/60">
              Product
            </p>
            <Link href="/dashboard" className="text-paper hover:underline">
              Dashboard
            </Link>
            <Link href="/create" className="text-paper hover:underline">
              New plan
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-night-muted/60">
              Network
            </p>
            <span className="text-paper">Solana</span>
            <span className="text-paper">Backed xStocks</span>
          </div>
        </div>
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 right-4 hidden select-none font-display text-[11rem] leading-none text-white/[0.04] lg:block"
      >
        Drip.
      </span>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-night-muted/70 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>Demo on Solana devnet. Not investment advice.</p>
          <p>Availability varies by jurisdiction.</p>
        </div>
      </div>
    </footer>
  );
}