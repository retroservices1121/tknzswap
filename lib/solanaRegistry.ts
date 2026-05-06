import "server-only";
import type { Token } from "@/types/token";

// Jupiter token registry — the de facto curated Solana token list.
// Verified-tag endpoint returns ~600 tokens with active liquidity that
// Jupiter has marked as safe-to-trade. DFlow's market makers can route
// against effectively the same universe (any SPL with on-chain liquidity).
const JUPITER_VERIFIED = "https://tokens.jup.ag/tokens?tags=verified";

interface JupiterToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface CachedRegistry {
  fetchedAt: number;
  tokens: Token[];
}

const ONE_HOUR_MS = 60 * 60 * 1000;
let cache: CachedRegistry | null = null;

// Deterministic muted background per token (so the fallback circle has a
// consistent color even when no logoURI is present).
function colorForSymbol(sym: string): string {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
  const palette = ["#9945FF", "#03E1FF", "#B4FF6A", "#F7C2FF", "#FFA500", "#7DFFB3", "#4F7CFF", "#C8F284"];
  return palette[h % palette.length];
}

export async function getSolanaTokenRegistry(): Promise<Token[]> {
  if (cache && Date.now() - cache.fetchedAt < ONE_HOUR_MS) {
    return cache.tokens;
  }

  const res = await fetch(JUPITER_VERIFIED, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    // If we already have a stale cache, serve it rather than failing.
    if (cache) return cache.tokens;
    throw new Error(`Jupiter registry fetch failed: ${res.status}`);
  }

  const raw = (await res.json()) as JupiterToken[];

  const tokens: Token[] = raw
    .filter((t) => t.address && t.symbol && Number.isFinite(t.decimals))
    .map((t) => ({
      symbol: t.symbol,
      name: t.name || t.symbol,
      decimals: t.decimals,
      chainId: "solana" as const,
      address: t.address,
      logoURI: t.logoURI,
      verified: true,
      bg: colorForSymbol(t.symbol),
      fg: "#080A0F",
    }));

  cache = { fetchedAt: Date.now(), tokens };
  return tokens;
}
