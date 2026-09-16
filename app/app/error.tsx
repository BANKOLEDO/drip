"use client";

import Link from "next/link";
import { CornerMark } from "@/components/ui/corner-mark";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16 sm:px-6">
      <div className="relative w-full overflow-hidden bg-night p-8 text-center sm:p-12">
        <CornerMark className="-top-[6px] -left-[6px]" />
        <CornerMark className="-top-[6px] -right-[6px]" />
        <CornerMark className="-bottom-[6px] -left-[6px]" />
        <CornerMark className="-bottom-[6px] -right-[6px]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-8 pattern-night-drips opacity-60" />
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-leaf-bright">
          Something spilled
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-paper sm:text-3xl">
          The guard paused this page, too.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-night-muted">
          Something broke on our side. Your wallet and plans are untouched.
          Try the moment again.
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-paper px-6 text-base font-medium text-ink transition-colors hover:bg-card"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control border border-paper/40 px-6 text-base font-medium text-paper transition-colors hover:bg-paper/10"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
