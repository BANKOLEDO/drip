import type { Metadata } from "next";
import Link from "next/link";
import { CornerMark } from "@/components/ui/corner-mark";

export const metadata: Metadata = {
  title: "Lost | Drip",
  description: "This page missed the bucket.",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16 sm:px-6">
      <div className="relative w-full overflow-hidden border border-hair bg-card p-8 text-center sm:p-12">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-money-deep">
          404 · off the ledger
        </p>
        <p
          aria-hidden
          className="mt-4 font-mono text-7xl font-semibold tabular text-money/10 sm:text-8xl"
        >
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          This drip missed the bucket.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-sub">
          The page you reached for isn&apos;t on any schedule. Head back and
          pick up where you left off.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-money px-6 text-base font-medium text-white transition-colors hover:bg-money-hover"
          >
            Back home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-hair bg-card px-6 text-base font-medium text-ink transition-colors hover:border-money-deep hover:bg-money-deep hover:text-white"
          >
            See plans
          </Link>
        </div>
      </div>
    </main>
  );
}
