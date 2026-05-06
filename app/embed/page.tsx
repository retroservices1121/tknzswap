"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SwapCard } from "@/components/swap/SwapCard";
import { useSwapStore } from "@/store/swap";
import { ALL_TOKENS, SOLANA_TOKENS, EVM_TOKENS } from "@/lib/tokens";
import type { Token } from "@/types/token";

// Resolve a token preset from query params:
//   ?from=SOL&fromChain=solana&to=USDC&toChain=solana
//   ?from=ETH&fromChain=1&to=USDC&toChain=8453
function resolvePreset(
  symbol: string | null,
  chainSpec: string | null
): Token | null {
  if (!symbol) return null;
  const sym = symbol.toUpperCase();

  let chainId: number | "solana" | null = null;
  if (chainSpec) {
    if (chainSpec.toLowerCase() === "solana" || chainSpec.toLowerCase() === "sol") {
      chainId = "solana";
    } else {
      const n = parseInt(chainSpec, 10);
      if (!Number.isNaN(n)) chainId = n;
    }
  }

  if (chainId === null) {
    // No chain specified — prefer Solana, then Ethereum.
    return (
      SOLANA_TOKENS.find((t) => t.symbol === sym) ??
      EVM_TOKENS.find((t) => t.symbol === sym && t.chainId === 1) ??
      ALL_TOKENS.find((t) => t.symbol === sym) ??
      null
    );
  }

  return ALL_TOKENS.find((t) => t.symbol === sym && t.chainId === chainId) ?? null;
}

function EmbedInner() {
  const params = useSearchParams();
  const { setFrom, setTo } = useSwapStore();

  useEffect(() => {
    const from = resolvePreset(params.get("from"), params.get("fromChain"));
    const to = resolvePreset(params.get("to"), params.get("toChain"));
    if (from) setFrom(from);
    if (to) setTo(to);
  }, [params, setFrom, setTo]);

  return (
    <div className="embed-wrap">
      <SwapCard />
      <a
        href="https://tknz.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="embed-attribution"
      >
        Powered by <b>tknz</b>
      </a>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="embed-wrap" />}>
      <EmbedInner />
    </Suspense>
  );
}
