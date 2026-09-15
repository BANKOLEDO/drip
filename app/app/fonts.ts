import { Inter, Geist_Mono, Newsreader } from "next/font/google";

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial serif for display headings — the anti-generic pairing with
// tabular mono money figures.
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});