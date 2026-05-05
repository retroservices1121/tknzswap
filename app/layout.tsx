import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";
import { Nav } from "@/components/layout/Nav";
import { InfraTopbar } from "@/components/layout/InfraTopbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "tknz — SEC-compliant cross-chain swap aggregator",
  description:
    "Route any asset across Solana and EVM at the best price. Solana via DFlow. EVM via Li.Fi. Covered user interface under SEC Rule 15b9-1.",
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
        <Providers>
          <Nav />
          <InfraTopbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
