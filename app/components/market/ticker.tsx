import { NextGuardWindow } from "@/components/guard/next-guard-window";
import { formatMoney } from "@/lib/format";

// Static sample prices until the live Kraken fair-price feed is wired in.
const prices: Record<string, number> = {
  AAPLx: 261.12,
  NVDAx: 134.28,
  TSLAx: 262.05,
  SPYx: 581.4,
  MSFTx: 428.16,
  GOOGLx: 176.9,
  AMZNx: 193.05,
  METAx: 512.3,
  QQQx: 499.6,
  HOODx: 17.44,
};

const order: (keyof typeof prices)[] = [
  "AAPLx",
  "NVDAx",
  "TSLAx",
  "SPYx",
  "MSFTx",
  "GOOGLx",
  "AMZNx",
  "METAx",
  "QQQx",
  "HOODx",
];

export function MarketTicker() {
  return (
    <div className="overflow-hidden border-b border-hair bg-paper">
      <div className="flex items-stretch divide-x divide-hair overflow-x-auto">
        {order.map((sym) => (
          <div
            key={sym}
            className="flex shrink-0 items-baseline gap-2 px-5 py-3"
          >
            <span className="font-mono text-xs text-sub">{sym}</span>
            <span className="font-mono text-sm font-semibold text-ink tabular">
              ${formatMoney(prices[sym])}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 pl-5 pr-4">
          <span className="hidden font-mono text-xs uppercase tracking-[0.18em] text-sub md:inline">
            Fair prices · demo
          </span>
          <NextGuardWindow />
        </div>
      </div>
    </div>
  );
}