/**
 * Full-bleed drip-pattern divider between landing sections: hairline
 * frame, falling-drips band, optional centered mono label chip.
 */
export function DripSeparator({ label }: { label?: string }) {
  return (
    <div
      aria-hidden={label ? undefined : true}
      className="border-y border-hair bg-paper"
    >
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="h-7 pattern-drips opacity-[0.18] sm:h-9" />
        {label && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="border border-hair bg-paper px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-sub">
              {label}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
