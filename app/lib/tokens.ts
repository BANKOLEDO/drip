export type StockSymbol =
  | "AAPLx"
  | "NVDAx"
  | "TSLAx"
  | "SPYx"
  | "MSFTx"
  | "GOOGLx"
  | "AMZNx"
  | "METAx"
  | "QQQx"
  | "HOODx";

export const STOCKS: Record<
  StockSymbol,
  {
    name: string;
    symbol: StockSymbol;
    // Verified mainnet mints via api.backed.fi/api/v2/public/assets
    mint: string;
    logo: string;
  }
> = {
  AAPLx: {
    name: "Apple",
    symbol: "AAPLx",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/AAPLx.png",
  },
  NVDAx: {
    name: "NVIDIA",
    symbol: "NVDAx",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/NVDAx.png",
  },
  TSLAx: {
    name: "Tesla",
    symbol: "TSLAx",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/TSLAx.png",
  },
  SPYx: {
    name: "S&P 500 ETF",
    symbol: "SPYx",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/SPYx.png",
  },
  MSFTx: {
    name: "Microsoft",
    symbol: "MSFTx",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/MSFTx.png",
  },
  GOOGLx: {
    name: "Alphabet",
    symbol: "GOOGLx",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/GOOGLx.png",
  },
  AMZNx: {
    name: "Amazon",
    symbol: "AMZNx",
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/AMZNx.png",
  },
  METAx: {
    name: "Meta",
    symbol: "METAx",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/METAx.png",
  },
  QQQx: {
    name: "Nasdaq 100 ETF",
    symbol: "QQQx",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/QQQx.png",
  },
  HOODx: {
    name: "Robinhood",
    symbol: "HOODx",
    mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/HOODx.png",
  },
};

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

// Verified AAPLx dividend Aug 8 2026 00:30 UTC
// raw x multiplier = scaled
export const AAPL_DIVIDEND = {
  exDateUtc: new Date("2026-08-08T00:30:00.000Z"),
  multiplierBefore: 1.0026642075893797,
  multiplierAfter: 1.0032690125398187,
  grossUsd: 0.27,
  netUsd: 0.189,
  withholdingPct: 30,
};

// Trigger pause window: +/- 15 min around the 00:30 UTC multiplier flip
export const PAUSE_WINDOW_MINUTES = 15;

export const NETWORK = (process.env.NEXT_PUBLIC_NETWORK ?? "mainnet") as
  | "mainnet"
  | "devnet";