"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { UnifiedRoute } from "@/types/route";
import type { SortDimension } from "@/types/swap";

interface EvmQuoteInput {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;     // raw token units, smallest denom
  sortBy: SortDimension;
  enabled: boolean;
}

export function useEvmQuote(params: EvmQuoteInput) {
  const { address } = useAccount();

  return useQuery<{ routes: UnifiedRoute[] }>({
    queryKey: [
      "evm-quote",
      params.fromChainId,
      params.toChainId,
      params.fromToken,
      params.toToken,
      params.fromAmount,
      params.sortBy,
      address,
    ],
    queryFn: async () => {
      const res = await fetch("/api/evm/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, walletAddress: address }),
      });
      if (!res.ok) throw new Error(`EVM quote failed: ${res.status}`);
      return res.json();
    },
    enabled:
      params.enabled &&
      !!address &&
      !!params.fromAmount &&
      params.fromAmount !== "0",
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 2,
  });
}
