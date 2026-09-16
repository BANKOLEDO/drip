import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Drip",
  description: "Drip privacy: no accounts, no tracking; your wallet stays in your browser.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-money-deep">
        Legal
      </p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Privacy
      </h1>
      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-sub">
        <p>
          Drip has no accounts and no analytics. There is nothing to sign up
          for and nothing tracking you across the site.
        </p>
        <p>
          Your wallet stays in your browser: connecting a wallet only lets the
          app prepare transactions for you to review and sign. Drip never sees,
          stores, or transmits your private keys or seed phrase.
        </p>
        <p>
          Market data comes from public third-party APIs (Pyth, Kraken, Yahoo,
          PreStocks, Tessera, Jupiter). Requesting a price necessarily reveals
          your network address to those providers, the same as visiting any
          website.
        </p>
        <p>
          Plan settings live on Solana devnet as public on-chain records tied
          to your wallet address. Anyone can read them; that is how the guard
          and your receipts stay verifiable.
        </p>
      </div>
    </main>
  );
}
