import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";

function Bar({ accent }: { accent?: boolean }) {
  return (
    <div className="flex items-end gap-1">
      <span
        className={cn("w-1.5 rounded-sm", accent ? "bg-amber" : "bg-money")}
        style={{ height: 8 }}
      />
      <span
        className={cn("w-1.5 rounded-sm", accent ? "bg-amber" : "bg-money")}
        style={{ height: 14 }}
      />
      <span
        className={cn("w-1.5 rounded-sm", accent ? "bg-amber" : "bg-money")}
        style={{ height: 10 }}
      />
    </div>
  );
}

// Browser frame showing a miniature Drip dashboard. Serves as the product
// hero for people who have not opened the app yet.
export function BrowserMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-card border border-hair bg-card",
        className,
      )}
    >
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b border-hair bg-paper px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex h-6 min-w-0 items-center gap-1.5 rounded-control border border-hair bg-card px-3 font-mono text-[10px] text-sub">
          <span className="text-money">●</span>
          app.drip.finance
        </div>
        <div className="w-10" />
      </div>

      {/* Mini app */}
      <div className="bg-paper p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span className="text-xs font-semibold text-ink">Drip</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-sub">
            <span className="h-1.5 w-1.5 rounded-full bg-money" />
            guard on
          </div>
        </div>

        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sub">
          Portfolio value
        </p>
        <p className="mt-0.5 font-display text-3xl font-medium tracking-tight text-ink tabular">
          $3,105.11
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-sub">
          12.88 scaled AAPLx
        </p>

        <div className="mt-3 flex items-center justify-between rounded-control border border-hair bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <Bar />
            <div>
              <p className="text-[11px] font-semibold text-ink">Next buy</p>
              <p className="font-mono text-[10px] text-sub">$50.00 weekly</p>
            </div>
          </div>
          <span className="rounded-full border border-hair bg-paper px-2 py-0.5 font-mono text-[10px] text-sub tabular">
            04:12:33
          </span>
        </div>

        <div className="mt-2 rounded-control border border-money/20 bg-money/[0.03] px-3 py-2">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sub">
              Scaled receipt
            </p>
            <span className="font-mono text-[10px] text-money-deep tabular">
              × 1.0032690
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1 font-mono text-[11px] text-ink tabular">
            <span>0.4128 raw</span>
            <span className="text-sub">→ scaled</span>
            <span className="font-semibold text-money-deep">0.4141</span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-control border border-hair bg-card px-3 py-2">
          <div className="flex-1">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-hair">
              <div className="w-[45%] rounded-full bg-amber" />
            </div>
          </div>
          <span className="font-mono text-[10px] text-sub">cap 1.0%</span>
        </div>
      </div>
    </div>
  );
}