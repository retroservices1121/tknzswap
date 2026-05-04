"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import type { DFlowQuoteResponse } from "@/lib/dflow";

interface SolanaQuoteInput {
  inputMint: string;
  outputMint: string;
  amount: string; // raw lamports / token units
  slippageBps: number;
  enabled: boolean;
}

export function useSolanaQuote(params: SolanaQuoteInput) {
  const { publicKey } = useWallet();

  return useQuery<DFlowQuoteResponse>({
    queryKey: [
      "solana-quote",
      params.inputMint,
      params.outputMint,
      params.amount,
      params.slippageBps,
    ],
    queryFn: async () => {
      const res = await fetch(
        "/api/solana/quote?" +
          new URLSearchParams({
            inputMint: params.inputMint,
            outputMint: params.outputMint,
            amount: params.amount,
            slippageBps: params.slippageBps.toString(),
          }).toString()
      );
      if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
      return res.json();
    },
    enabled:
      params.enabled &&
      !!publicKey &&
      !!params.amount &&
      params.amount !== "0",
    staleTime: 20_000,
    refetchInterval: 20_000,
    retry: 2,
  });
}
