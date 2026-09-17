"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { createSolanaClient } from "@metamask/connect-solana";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

const MetaMaskReadyContext = createContext(false);

export function useMetaMaskReady() {
  return useContext(MetaMaskReadyContext);
}

// Wallet Standard discovery (Phantom, Solflare, Backpack) plus MetaMask
// via @metamask/connect-solana.
export function WalletProviders({ children }: { children: ReactNode }) {
  const network =
    process.env.NEXT_PUBLIC_NETWORK === "mainnet"
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [mmReady, setMmReady] = useState(false);

  useEffect(() => {
    // Register MetaMask for the Wallet Standard registry, if installed.
    void createSolanaClient({
      dapp: { name: "Drip", url: window.location.origin },
    })
      .then(() => setMmReady(true))
      .catch(() => setMmReady(true));
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={[]}
        autoConnect
        onError={(e) => {
          // Absent/locked wallet on autoload is normal, not an error.
          // Only real failures reach the console.
          const ignorable = [
            "WalletConnectionError",
            "WalletNotReadyError",
            "WalletNotSelectedError",
            "WalletNotConnectedError",
          ];
          if (e instanceof Error && ignorable.includes(e.name)) return;
          console.error(e);
        }}
      >
        <MetaMaskReadyContext.Provider value={mmReady}>
          {children}
        </MetaMaskReadyContext.Provider>
      </WalletProvider>
    </ConnectionProvider>
  );
}