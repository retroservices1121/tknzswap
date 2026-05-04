import type { Token } from "@/types/token";
import type { ChainId } from "./chains";

// Native sentinel addresses
export const NATIVE_EVM = "0x0000000000000000000000000000000000000000";
export const SOL_MINT = "So11111111111111111111111111111111111111112";

// EVM tokens — addresses per chain
export const EVM_TOKENS: Token[] = [
  { symbol: "ETH",   name: "Ether",          decimals: 18, chainId: 1,     address: NATIVE_EVM,                                  bg: "#8A95A3", fg: "#080A0F" },
  { symbol: "USDC",  name: "USD Coin",       decimals: 6,  chainId: 1,     address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", bg: "#2775CA", fg: "#ffffff" },
  { symbol: "USDT",  name: "Tether",         decimals: 6,  chainId: 1,     address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", bg: "#26A17B", fg: "#ffffff" },
  { symbol: "WBTC",  name: "Wrapped Bitcoin",decimals: 8,  chainId: 1,     address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", bg: "#F7931A", fg: "#080A0F" },

  { symbol: "ETH",   name: "Ether",          decimals: 18, chainId: 42161, address: NATIVE_EVM,                                  bg: "#8A95A3", fg: "#080A0F" },
  { symbol: "ARB",   name: "Arbitrum",       decimals: 18, chainId: 42161, address: "0x912CE59144191C1204E64559FE8253a0e49E6548", bg: "#28A0F0", fg: "#ffffff" },
  { symbol: "USDC",  name: "USD Coin",       decimals: 6,  chainId: 42161, address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", bg: "#2775CA", fg: "#ffffff" },

  { symbol: "ETH",   name: "Ether",          decimals: 18, chainId: 8453,  address: NATIVE_EVM,                                  bg: "#8A95A3", fg: "#080A0F" },
  { symbol: "USDC",  name: "USD Coin",       decimals: 6,  chainId: 8453,  address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", bg: "#2775CA", fg: "#ffffff" },

  { symbol: "ETH",   name: "Ether",          decimals: 18, chainId: 10,    address: NATIVE_EVM,                                  bg: "#8A95A3", fg: "#080A0F" },
  { symbol: "OP",    name: "Optimism",       decimals: 18, chainId: 10,    address: "0x4200000000000000000000000000000000000042", bg: "#FF0420", fg: "#ffffff" },
  { symbol: "USDC",  name: "USD Coin",       decimals: 6,  chainId: 10,    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", bg: "#2775CA", fg: "#ffffff" },

  { symbol: "MATIC", name: "Polygon",        decimals: 18, chainId: 137,   address: NATIVE_EVM,                                  bg: "#8247E5", fg: "#ffffff" },
  { symbol: "USDC",  name: "USD Coin",       decimals: 6,  chainId: 137,   address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", bg: "#2775CA", fg: "#ffffff" },
];

// Solana tokens — mint addresses
export const SOLANA_TOKENS: Token[] = [
  { symbol: "SOL",   name: "Solana",      decimals: 9, chainId: "solana", address: SOL_MINT,                                          bg: "#B4FF6A", fg: "#080A0F" },
  { symbol: "USDC",  name: "USD Coin",    decimals: 6, chainId: "solana", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", bg: "#2775CA", fg: "#ffffff" },
  { symbol: "USDT",  name: "Tether",      decimals: 6, chainId: "solana", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", bg: "#26A17B", fg: "#ffffff" },
  { symbol: "JTO",   name: "Jito",        decimals: 9, chainId: "solana", address: "jtojtomepa8bdgrXSGBW8Aa8AH3VKXKbXq6oPaKinZ",  bg: "#4F7CFF", fg: "#ffffff" },
  { symbol: "JUP",   name: "Jupiter",     decimals: 6, chainId: "solana", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",  bg: "#C8F284", fg: "#080A0F" },
  { symbol: "BONK",  name: "Bonk",        decimals: 5, chainId: "solana", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", bg: "#FFA500", fg: "#080A0F" },
  { symbol: "WIF",   name: "dogwifhat",   decimals: 6, chainId: "solana", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", bg: "#D5C7B8", fg: "#080A0F" },
  { symbol: "PYTH",  name: "Pyth Network",decimals: 6, chainId: "solana", address: "HZ1JovNiVvGrv1SooJzJGiJEjn6Z2g9K5E4rSRkTp",   bg: "#7E5BFF", fg: "#ffffff" },
];

export const ALL_TOKENS: Token[] = [...SOLANA_TOKENS, ...EVM_TOKENS];

export function tokensForChain(chainId: ChainId): Token[] {
  return ALL_TOKENS.filter((t) => t.chainId === chainId);
}

export function findToken(chainId: ChainId, address: string): Token | undefined {
  return ALL_TOKENS.find((t) => t.chainId === chainId && t.address.toLowerCase() === address.toLowerCase());
}

// Convert human-readable amount to raw units in smallest denomination (string for BigInt safety).
export function toRawAmount(human: string, decimals: number): string {
  if (!human) return "0";
  const n = parseFloat(human);
  if (isNaN(n) || n <= 0) return "0";
  // Use string math to avoid floating-point drift on tokens with many decimals.
  const [whole, frac = ""] = human.split(".");
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const cleanWhole = (whole || "0").replace(/^0+(?!$)/, "");
  const combined = (cleanWhole + fracPadded).replace(/^0+(?!$)/, "");
  return combined || "0";
}

export function fromRawAmount(raw: string, decimals: number): number {
  if (!raw) return 0;
  try {
    const big = BigInt(raw);
    const div = 10n ** BigInt(decimals);
    return Number(big / div) + Number(big % div) / Number(div);
  } catch {
    return 0;
  }
}
