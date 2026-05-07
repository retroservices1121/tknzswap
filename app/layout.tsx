import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";

export const metadata: Metadata = {
  title: "tknz — Solana-first cross-chain swap aggregator",
  description:
    "Trade across Solana and EVM in one signature. Solana via DFlow with Jito-bundle protection. EVM via Li.Fi. Cross-VM via Mayan Swift. Non-custodial.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#080A0F",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
