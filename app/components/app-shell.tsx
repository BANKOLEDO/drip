"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { ModeToggle } from "@/components/mode/mode-toggle";
import { NETWORK } from "@/lib/tokens";
import { cn } from "@/lib/cn";

// Chrome concept: a ledger status line, not a navbar.
// At rest it is a flat full-width line (no border). On scroll it
// collapses into a centered floating pill capped at max-w-3xl.
// Mobile splits it: brand + wallet up top, black command strip under thumb.

const commands = [
  { href: "/", label: "home" },
  { href: "/dashboard", label: "plans" },
  { href: "/create", label: "+ new" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/dashboard")
    return pathname === "/dashboard" || pathname.startsWith("/plan/");
  return pathname === href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-12">
      {/* Desktop: flat line at rest → floating pill on scroll */}
      <div className="hidden md:block">
        <div
          className={cn(
            "mx-auto flex h-12 items-center gap-5 transition-all duration-300",
            scrolled
              ? "mt-2 h-10 w-full max-w-3xl items-center bg-card px-4 shadow-lg"
              : "h-12 w-full max-w-6xl px-4 sm:px-6",
          )}
        >
          <Link href="/" aria-label="Drip home" className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span className="font-sans text-[15px] font-semibold tracking-tight text-ink">
              Drip
            </span>
          </Link>

          <span aria-hidden className="text-hair">
            /
          </span>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {commands.map((c, i) => {
              const active = isActive(pathname, c.href);
              return (
                <span key={c.href} className="flex items-center gap-1">
                  {i > 0 && (
                    <span aria-hidden className="text-hair">
                      /
                    </span>
                  )}
                  <Link
                    href={c.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-1 py-1 uppercase tracking-[0.14em]",
                      active ? "font-semibold text-ink" : "text-sub hover:text-ink",
                    )}
                  >
                    {active ? `[${c.label}]` : c.label}
                  </Link>
                </span>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ModeToggle />
            <ConnectWalletButton />
          </div>
        </div>
      </div>

      {/* Mobile: solid top bar so page content never shows under it */}
      <div className="bg-paper/95 backdrop-blur-sm md:hidden">
          <div className="mx-auto flex h-11 w-full items-center justify-between gap-2 px-4">
            <Link href="/" aria-label="Drip home" className="flex items-center gap-1.5">
              <LogoMark className="h-5 w-5" />
              <span className="font-sans text-[15px] font-semibold tracking-tight text-ink">
                Drip
              </span>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <ModeToggle compact />
              <ConnectWalletButton />
            </div>
          </div>
      </div>

      {/* Mobile: one floating command pill under thumb. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-20 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="mx-auto mb-3 flex w-fit max-w-[94%] items-center gap-1 rounded-full border border-white/10 bg-night px-1.5 py-1 shadow-lg">
          {commands.map((c) => {
            const active = isActive(pathname, c.href);
            const isNew = c.href === "/create";
            return (
              <Link
                key={c.href}
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "bg-paper text-night"
                    : isNew
                      ? "font-semibold text-paper hover:bg-paper/10"
                      : "text-night-muted hover:text-paper",
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const links = [
    { href: "/dashboard", label: "dashboard" },
    { href: "/create", label: "new plan" },
    { href: "/#assets", label: "xstocks" },
    { href: "/#assets", label: "prestocks" },
    { href: "/#assets", label: "t-tokens" },
    { href: "/terms", label: "terms" },
    { href: "/privacy", label: "privacy" },
  ];
  return (
    <>
      <footer className="mt-4 bg-night text-night-muted">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs"
          >
            <Link
              href="/"
              aria-label="Drip home"
              className="flex items-center gap-1.5 text-paper"
            >
              <LogoMark />
              <span className="text-[13px] font-semibold tracking-tight">
                drip
              </span>
            </Link>
            {links.map((link) => (
              <span key={link.label} className="flex items-center gap-3">
                <span aria-hidden className="text-white/20">
                  /
                </span>
                <Link
                  href={link.href}
                  className="text-paper/75 transition-colors hover:text-paper"
                >
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-3 md:ml-auto">
              <span aria-hidden className="text-white/20">
                /
              </span>
              <span className="flex items-center gap-1.5 text-paper/75">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
                {NETWORK}
              </span>
            </span>
          </nav>
          <p className="mt-3 text-[11px] leading-relaxed text-night-muted/70">
            Demo on Solana {NETWORK}. Not investment advice. Availability
            varies by jurisdiction. Illustrations by{" "}
            <a
              href="https://www.magnific.com"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-paper"
            >
              Magnific
            </a>
            .
          </p>
        </div>
      </footer>
      {/* Spacer so the mobile command strip never covers footer content */}
      <div aria-hidden className="h-[72px] md:hidden" />
    </>
  );
}