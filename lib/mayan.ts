import "server-only";
import { fetchQuote, type Quote, type QuoteParams } from "@mayanfinance/swap-sdk";
import { MAYAN_REFERRER_BPS } from "./fee";
import type { ChainId } from "./chains";

// Mayan ChainName: 'solana' | 'ethereum' | 'bsc' | 'polygon' | 'avalanche' | 'arbitrum' | 'optimism' | 'base' | 'aptos'
type MayanChainName = QuoteParams["fromChain"];

const EVM_TO_MAYAN: Record<number, MayanChainName> = {
  1: "ethereum",
  42161: "arbitrum",
  8453: "base",
  10: "optimism",
  137: "polygon",
  56: "bsc",
};

export function chainIdToMayanName(chainId: ChainId): MayanChainName | null {
  if (chainId === "solana") return "solana";
  return EVM_TO_MAYAN[chainId] ?? null;
}

export interface MayanQuoteParams {
  fromChainId: ChainId;
  toChainId: ChainId;
  fromTokenAddress: string;   // EVM contract or SPL mint
  toTokenAddress: string;
  amount: number;             // human-readable amount (Mayan SDK uses floats)
  slippageBps?: number;       // default 50 (0.5%)
  referrerEvm?: string;
  referrerSolana?: string;
}

export interface MayanQuoteResult {
  quote: Quote;          // best quote (lowest type-priority gives Swift first)
  alternatives: Quote[]; // remaining alternatives if any
}

export async function getMayanQuote(params: MayanQuoteParams): Promise<MayanQuoteResult> {
  const fromChain = chainIdToMayanName(params.fromChainId);
  const toChain = chainIdToMayanName(params.toChainId);
  if (!fromChain || !toChain) {
    throw new Error(`Unsupported chain for Mayan: ${params.fromChainId} → ${params.toChainId}`);
  }

  const sdkParams: QuoteParams = {
    amount: params.amount,
    fromToken: params.fromTokenAddress,
    fromChain,
    toToken: params.toTokenAddress,
    toChain,
    slippageBps: params.slippageBps ?? 50,
    referrerBps: MAYAN_REFERRER_BPS,
    referrer: params.referrerEvm,
  };

  // Swift is the preferred engine (atomic cross-VM, ~30s ETA). Fall back to MCTP.
  const quotes = await fetchQuote(sdkParams, {
    swift: true,
    mctp: true,
    gasless: false,
    onlyDirect: false,
  });

  if (!quotes || quotes.length === 0) {
    throw new Error("No Mayan route available for this pair");
  }

  // SDK already orders by best price/effectiveness. Take first.
  return { quote: quotes[0], alternatives: quotes.slice(1) };
}
