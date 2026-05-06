"use client";

import { useQuery } from "@tanstack/react-query";

export interface TrendingToken {
  mint: string;
  symbol: string;
  name: string;
  logoURI: string | null;
  priceUSD: number;
  volume24hUSD: number;
  priceChange24h: number;
  priceChange1h: number;
  fdvUSD: number | null;
  poolName: string;
  poolAddress: string;
  poolAgeMinutes: number | null;
}

async function fetchTrending(): Promise<TrendingToken[]> {
  const res = await fetch("/api/trending");
  if (!res.ok) throw new Error(`Trending HTTP ${res.status}`);
  const data = (await res.json()) as { tokens: TrendingToken[] };
  return data.tokens ?? [];
}

export function useTrending() {
  return useQuery({
    queryKey: ["trending-solana"],
    queryFn: fetchTrending,
    staleTime: 60_000,
    refetchInterval: 120_000,
    refetchOnWindowFocus: false,
  });
}
