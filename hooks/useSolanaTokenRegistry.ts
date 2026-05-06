"use client";

import { useQuery } from "@tanstack/react-query";
import type { Token } from "@/types/token";

async function fetchRegistry(): Promise<Token[]> {
  const res = await fetch("/api/solana/tokens");
  if (!res.ok) throw new Error(`Registry HTTP ${res.status}`);
  const data = (await res.json()) as { tokens: Token[] };
  return data.tokens ?? [];
}

export function useSolanaTokenRegistry() {
  return useQuery({
    queryKey: ["solana-token-registry"],
    queryFn: fetchRegistry,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
