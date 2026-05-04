export type ChainType = "evm" | "solana";
export type ExecutionLayer = "lifi" | "dflow";
export type ChainId = number | "solana";

export interface EvmChain {
  id: number;
  slug: string;
  name: string;
  symbol: string;
  color: string;
  lifiChainId: number;
}

export const EVM_CHAINS: readonly EvmChain[] = [
  { id: 1,     slug: "eth",  name: "Ethereum", symbol: "ETH",   color: "#627EEA", lifiChainId: 1     },
  { id: 42161, slug: "arb",  name: "Arbitrum", symbol: "ETH",   color: "#28A0F0", lifiChainId: 42161 },
  { id: 8453,  slug: "base", name: "Base",     symbol: "ETH",   color: "#0052FF", lifiChainId: 8453  },
  { id: 10,    slug: "opt",  name: "Optimism", symbol: "ETH",   color: "#FF0420", lifiChainId: 10    },
  { id: 137,   slug: "pol",  name: "Polygon",  symbol: "MATIC", color: "#8247E5", lifiChainId: 137   },
  { id: 56,    slug: "bnb",  name: "BNB",      symbol: "BNB",   color: "#F0B90B", lifiChainId: 56    },
] as const;

export const SOLANA_CHAIN = {
  id: "solana" as const,
  slug: "sol",
  name: "Solana",
  symbol: "SOL",
  color: "#9945FF",
} as const;

export type AnyChain = EvmChain | typeof SOLANA_CHAIN;

export const ALL_CHAINS: readonly AnyChain[] = [SOLANA_CHAIN, ...EVM_CHAINS];

// THE single routing decision. Never put this logic anywhere else.
export function getExecutionLayer(chainId: ChainId): ExecutionLayer {
  return chainId === "solana" ? "dflow" : "lifi";
}

export function getChainType(chainId: ChainId): ChainType {
  return chainId === "solana" ? "solana" : "evm";
}

export function chainBySlug(slug: string): AnyChain | undefined {
  return ALL_CHAINS.find((c) => c.slug === slug);
}

export function chainById(id: ChainId): AnyChain | undefined {
  return ALL_CHAINS.find((c) => c.id === id);
}
