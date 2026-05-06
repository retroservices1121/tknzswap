import type { ChainId } from "@/lib/chains";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;

  // EVM tokens carry a chainId (number) + contract address.
  // Solana tokens carry chainId === "solana" + mint address.
  chainId: ChainId;
  address: string;

  // Display only — first letter rendered into a colored circle as the icon
  bg: string;
  fg: string;

  // Optional logo URL (Jupiter registry tokens carry one); falls back to colored circle.
  logoURI?: string;

  // Marks tokens loaded from a curated/verified registry vs. user-pasted mints.
  verified?: boolean;

  // Optional balance + USD price (populated client-side via wallet/price feed)
  bal?: number;
  usd?: number;
}
