import "server-only";

// Geckoterminal — public, no API key required.
// Trending pools endpoint with included base/quote token relationships.
const GT_TRENDING = "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?include=base_token,quote_token&page=1";

interface GtRelationshipRef {
  data: { id: string; type: string };
}

interface GtPool {
  id: string;
  attributes: {
    name: string;
    base_token_price_usd: string | null;
    quote_token_price_usd: string | null;
    address: string;
    price_change_percentage: { h1: string; h6: string; h24: string };
    transactions: { h24: { buys: number; sells: number; buyers: number; sellers: number } };
    volume_usd: { h1: string; h6: string; h24: string };
    market_cap_usd: string | null;
    fdv_usd: string | null;
    pool_created_at: string;
  };
  relationships: {
    base_token: GtRelationshipRef;
    quote_token: GtRelationshipRef;
  };
}

interface GtIncludedToken {
  id: string;
  type: "token";
  attributes: {
    address: string;
    name: string;
    symbol: string;
    image_url?: string | null;
    coingecko_coin_id?: string | null;
  };
}

interface GtTrendingResponse {
  data: GtPool[];
  included?: GtIncludedToken[];
}

export interface TrendingToken {
  mint: string;
  symbol: string;
  name: string;
  logoURI: string | null;
  priceUSD: number;
  volume24hUSD: number;
  priceChange24h: number; // signed percent
  priceChange1h: number;
  fdvUSD: number | null;
  poolName: string;
  poolAddress: string;
  poolAgeMinutes: number | null;
}

const QUOTE_TOKEN_BLACKLIST = new Set([
  "So11111111111111111111111111111111111111112", // wSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
]);

interface CachedTrending {
  fetchedAt: number;
  tokens: TrendingToken[];
}

const TWO_MIN_MS = 2 * 60 * 1000;
let cache: CachedTrending | null = null;

export async function getTrendingSolanaTokens(): Promise<TrendingToken[]> {
  if (cache && Date.now() - cache.fetchedAt < TWO_MIN_MS) {
    return cache.tokens;
  }

  const res = await fetch(GT_TRENDING, {
    headers: { Accept: "application/json" },
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    if (cache) return cache.tokens;
    throw new Error(`Geckoterminal trending fetch failed: ${res.status}`);
  }

  const data = (await res.json()) as GtTrendingResponse;
  const tokenMap = new Map<string, GtIncludedToken>();
  for (const t of data.included ?? []) {
    if (t.type === "token") tokenMap.set(t.id, t);
  }

  const out: TrendingToken[] = [];
  const seen = new Set<string>();

  for (const pool of data.data) {
    const baseRef = pool.relationships.base_token.data.id;
    const baseTok = tokenMap.get(baseRef);
    if (!baseTok) continue;

    // Skip if the "base" is itself a stable/wSOL — pick the other side instead.
    let chosen = baseTok;
    if (QUOTE_TOKEN_BLACKLIST.has(baseTok.attributes.address)) {
      const quoteRef = pool.relationships.quote_token.data.id;
      const quoteTok = tokenMap.get(quoteRef);
      if (!quoteTok || QUOTE_TOKEN_BLACKLIST.has(quoteTok.attributes.address)) continue;
      chosen = quoteTok;
    }

    if (seen.has(chosen.attributes.address)) continue;
    seen.add(chosen.attributes.address);

    const created = new Date(pool.attributes.pool_created_at);
    const ageMin = Number.isFinite(created.getTime())
      ? Math.max(0, Math.floor((Date.now() - created.getTime()) / 60_000))
      : null;

    out.push({
      mint: chosen.attributes.address,
      symbol: chosen.attributes.symbol,
      name: chosen.attributes.name,
      logoURI: chosen.attributes.image_url ?? null,
      priceUSD: parseFloat(pool.attributes.base_token_price_usd ?? "0"),
      volume24hUSD: parseFloat(pool.attributes.volume_usd?.h24 ?? "0"),
      priceChange24h: parseFloat(pool.attributes.price_change_percentage?.h24 ?? "0"),
      priceChange1h: parseFloat(pool.attributes.price_change_percentage?.h1 ?? "0"),
      fdvUSD: pool.attributes.fdv_usd ? parseFloat(pool.attributes.fdv_usd) : null,
      poolName: pool.attributes.name,
      poolAddress: pool.attributes.address,
      poolAgeMinutes: ageMin,
    });
  }

  cache = { fetchedAt: Date.now(), tokens: out };
  return out;
}
