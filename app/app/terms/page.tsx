import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | Drip",
  description: "Drip demo terms: non-custodial devnet pilot, no investment advice.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
        Legal
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Terms
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-sub">
        <p>
          Drip is a hackathon demo running on Solana devnet. Nothing here is
          investment advice, and demo positions have no real-world value.
        </p>
        <p>
          Drip is non-custodial: the program records your plan and guard
          settings, but it never holds your funds and never swaps on your
          behalf. Every buy is a transaction you sign yourself in your own
          wallet. Keep your seed phrase private; nobody on the Drip side will
          ever ask for it.
        </p>
        <p>
          Tokenized equities are issued by third parties (Backed, PreStocks,
          Tessera), each with their own terms, prices, and transfer
          restrictions. The premium guard compares live quotes against
          indicative fair prices and can pause or defer a buy, but it cannot
          guarantee a fill price or timing.
        </p>
        <p>
          Availability varies by jurisdiction. If tokenized equities are
          restricted where you live, do not use Drip to access them.
        </p>
      </div>
    </main>
  );
}
