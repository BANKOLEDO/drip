import type { Metadata } from "next";
import { inter, geistMono } from "./fonts";
import { SiteHeader, SiteFooter } from "@/components/app-shell";
import { WalletProviders } from "@/components/wallet/wallet-provider";
import { ModeProvider } from "@/components/mode/mode-context";
import { MODE_COOKIE, DEFAULT_MODE } from "@/lib/mode-keys";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://drip.finance"),
  title: "Drip | Auto-invest in US stocks. Dividends handled.",
  description:
    "Recurring auto-investing in tokenized US stocks on Solana that pauses around dividend cuts and guards weekend premium gaps.",
  icons: {
    icon: "/assets/logo.svg",
    apple: "/assets/logo.svg",
  },
  openGraph: {
    title: "Drip | Auto-invest in US stocks. Dividends handled.",
    description:
      "Recurring auto-investing in tokenized US stocks on Solana that pauses around dividend cuts and guards weekend premium gaps.",
    url: "https://drip.finance",
    type: "website",
    images: [
      {
        url: "/assets/og.jpg",
        width: 1600,
        height: 900,
        alt: "Drip: auto-invest in US stocks. Dividends handled.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/og.jpg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const jar = await cookies();
  const initialMode = jar.get(MODE_COOKIE)?.value === "live" ? "live" : DEFAULT_MODE;
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink flex flex-col">
        <WalletProviders>
          <ModeProvider initialMode={initialMode}>
            <SiteHeader />
            {children}
            <SiteFooter />
          </ModeProvider>
        </WalletProviders>
      </body>
    </html>
  );
}