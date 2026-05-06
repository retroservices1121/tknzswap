"use client";

import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@mayanfinance/swap-sdk";
import type { ChainId } from "@/lib/chains";

interface UseCrossQuoteParams {
  fromChainId: ChainId;
  toChainId: ChainId;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: number; // human-readable
  slippageBps: number;
  enabled: boolean;
}

interface CrossQuoteResponse {
  quote: Quote;
  alternatives: Quote[];
}

async function fetchCrossQuote(p: Omit<UseCrossQuoteParams, "enabled">): Promise<CrossQuoteResponse> {
  const res = await fetch("/api/cross/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(p),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Cross quote HTTP ${res.status}`);
  }
  return (await res.json()) as CrossQuoteResponse;
}

export function useCrossQuote(p: UseCrossQuoteParams) {
  return useQuery({
    queryKey: [
      "cross-quote",
      p.fromChainId,
      p.toChainId,
      p.fromTokenAddress,
      p.toTokenAddress,
      p.amount,
      p.slippageBps,
    ],
    queryFn: () =>
      fetchCrossQuote({
        fromChainId: p.fromChainId,
        toChainId: p.toChainId,
        fromTokenAddress: p.fromTokenAddress,
        toTokenAddress: p.toTokenAddress,
        amount: p.amount,
        slippageBps: p.slippageBps,
      }),
    enabled: p.enabled && p.amount > 0,
    staleTime: 8_000,
    refetchInterval: 12_000,
  });
}
