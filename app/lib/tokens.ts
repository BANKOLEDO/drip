export type AssetCategory = "public" | "prestocks" | "tessera";

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
  | "HOODx"
  | "SPACEx"
  | "OPENAIx"
  | "ANTHROPICx"
  | "NEURALINKx"
  | "KALSHIx"
  | "POLYMARKETx"
  | "FIGUREAIx"
  | "ANDURILx"
  | "T-OpenAI"
  | "T-Kalshi"
  | "T-SpaceX";

export const CATEGORY_LABEL: Record<AssetCategory, string> = {
  public: "Public",
  prestocks: "PreStocks",
  tessera: "T-Tokens",
};

// Default guard caps per market. Public equities track fair value tightly;
// pre-IPO and community tokens trade thin, so their starting cap is wider.
export const CATEGORY_DEFAULT_CAP_BPS: Record<AssetCategory, number> = {
  public: 100,
  prestocks: 300,
  tessera: 300,
};

export const STOCKS: Record<
  StockSymbol,
  {
    name: string;
    symbol: StockSymbol;
    // Verified mainnet mints:
    //  - xStocks via api.backed.fi/api/v2/public/assets
    //  - PreStocks via prestocks.com/api/prestocks (contract_address)
    //  - T-Tokens via rest-api.tessera.pe/v1/public/token-details (mint)
    mint: string;
    logo: string;
    category: AssetCategory;
    // On-chain decimals (verified): xStocks 8, PreStocks & T-Tokens 9,
    // USDC 6. Jupiter quotes come back in base units, so the fair-price
    // guard converts using per-asset decimals, never a hardcoded constant.
    decimals: number;
  }
> = {
  AAPLx: {
    name: "Apple",
    symbol: "AAPLx",
    mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/AAPLx.png",
    category: "public",
    decimals: 8,
  },
  NVDAx: {
    name: "NVIDIA",
    symbol: "NVDAx",
    mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/NVDAx.png",
    category: "public",
    decimals: 8,
  },
  TSLAx: {
    name: "Tesla",
    symbol: "TSLAx",
    mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/TSLAx.png",
    category: "public",
    decimals: 8,
  },
  SPYx: {
    name: "S&P 500 ETF",
    symbol: "SPYx",
    mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/SPYx.png",
    category: "public",
    decimals: 8,
  },
  MSFTx: {
    name: "Microsoft",
    symbol: "MSFTx",
    mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/MSFTx.png",
    category: "public",
    decimals: 8,
  },
  GOOGLx: {
    name: "Alphabet",
    symbol: "GOOGLx",
    mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/GOOGLx.png",
    category: "public",
    decimals: 8,
  },
  AMZNx: {
    name: "Amazon",
    symbol: "AMZNx",
    mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/AMZNx.png",
    category: "public",
    decimals: 8,
  },
  METAx: {
    name: "Meta",
    symbol: "METAx",
    mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/METAx.png",
    category: "public",
    decimals: 8,
  },
  QQQx: {
    name: "Nasdaq 100 ETF",
    symbol: "QQQx",
    mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/QQQx.png",
    category: "public",
    decimals: 8,
  },
  HOODx: {
    name: "Robinhood",
    symbol: "HOODx",
    mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
    logo: "https://xstocks-metadata.backed.fi/logos/tokens/HOODx.png",
    category: "public",
    decimals: 8,
  },
  SPACEx: {
    name: "SpaceX",
    symbol: "SPACEx",
    mint: "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh",
    logo: "https://www.prestocks.com/logos/spacex.png",
    category: "prestocks",
    decimals: 9,
  },
  OPENAIx: {
    name: "OpenAI",
    symbol: "OPENAIx",
    mint: "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
    logo: "https://www.prestocks.com/logos/openai.png",
    category: "prestocks",
    decimals: 9,
  },
  ANTHROPICx: {
    name: "Anthropic",
    symbol: "ANTHROPICx",
    mint: "Pren1FvFX6J3E4kXhJuCiAD5aDmGEb7qJRncwA8Lkhw",
    logo: "https://www.prestocks.com/logos/anthropic.png",
    category: "prestocks",
    decimals: 9,
  },
  NEURALINKx: {
    name: "Neuralink",
    symbol: "NEURALINKx",
    mint: "PrekqLJvJ3qVdXmBGDiexvwUTF4rLFDa6HWS4HJbw9S",
    logo: "https://www.prestocks.com/logos/neuralink.png",
    category: "prestocks",
    decimals: 9,
  },
  KALSHIx: {
    name: "Kalshi",
    symbol: "KALSHIx",
    mint: "PreLWGkkeqG1s4HEfFZSy9moCrJ7btsHuUtfcCeoRua",
    logo: "https://www.prestocks.com/logos/kalshi.png",
    category: "prestocks",
    decimals: 9,
  },
  POLYMARKETx: {
    name: "Polymarket",
    symbol: "POLYMARKETx",
    mint: "Pre8AREmFPtoJFT8mQSXQLh56cwJmM7CFDRuoGBZiUP",
    logo: "https://www.prestocks.com/logos/polymarket.png",
    category: "prestocks",
    decimals: 9,
  },
  FIGUREAIx: {
    name: "Figure AI",
    symbol: "FIGUREAIx",
    mint: "PreZad18qfPtbxNpMtMuAuX2zVpvkEU8DnJx56faCWd",
    logo: "https://www.prestocks.com/logos/figureai.png",
    category: "prestocks",
    decimals: 9,
  },
  ANDURILx: {
    name: "Anduril",
    symbol: "ANDURILx",
    mint: "PresTj4Yc2bAR197Er7wz4UUKSfqt6FryBEdAriBoQB",
    logo: "https://www.prestocks.com/logos/anduril.png",
    category: "prestocks",
    decimals: 9,
  },
  "T-OpenAI": {
    name: "T-OpenAI",
    symbol: "T-OpenAI",
    mint: "oPAiAikWTaFj9RYoRFD35ccfwhnMcB3ThgBZRHSkjTZ",
    logo: "https://www.tessera.pe/t_openai.png",
    category: "tessera",
    decimals: 9,
  },
  "T-Kalshi": {
    name: "T-Kalshi",
    symbol: "T-Kalshi",
    mint: "TKLSidmLVt3cqGaaodG8tyRzoANfQwoh67AccjmubeZ",
    logo: "https://www.tessera.pe/t_kalshi.png",
    category: "tessera",
    decimals: 9,
  },
  "T-SpaceX": {
    name: "T-SpaceX",
    symbol: "T-SpaceX",
    mint: "TSPXcLV76s6V2zDiZQ18kBfcbnjaE2ZzNT3ga2Pd99v",
    logo: "https://www.tessera.pe/t_spacex.png",
    category: "tessera",
    decimals: 9,
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