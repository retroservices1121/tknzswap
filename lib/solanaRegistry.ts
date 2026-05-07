import "server-only";
import type { Token } from "@/types/token";

// Jupiter Tokens V2 API — lite-api variant (no key required).
// Verified by direct fetch: returns a JSON array of token objects with the
// V2 schema (id, icon, symbol, name, decimals, isVerified, tags, ...).
const JUPITER_VERIFIED = "https://lite-api.jup.ag/tokens/v2/tag?query=verified";

// Legacy fallback in case any upstream cache still serves the old shape.
const JUPITER_LEGACY = "https://tokens.jup.ag/tokens?tags=verified";

interface JupiterTokenV2 {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
  tags?: string[];
  isVerified?: boolean;
}

interface JupiterTokenLegacy {
  address: string;
  symbol: string;
  name: string;
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

function colorForSymbol(sym: string): string {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
  const palette = ["#9945FF", "#03E1FF", "#B4FF6A", "#F7C2FF", "#FFA500", "#7DFFB3", "#4F7CFF", "#C8F284"];
  return palette[h % palette.length];
}

function normalizeFromV2(raw: JupiterTokenV2[]): Token[] {
  return raw
    .filter((t) => t.id && t.symbol && Number.isFinite(t.decimals))
    .map((t) => ({
      symbol: t.symbol,
      name: t.name || t.symbol,
      decimals: t.decimals,
      chainId: "solana" as const,
      address: t.id,
      logoURI: t.icon,
      verified: true,
      bg: colorForSymbol(t.symbol),
      fg: "#080A0F",
    }));
}

function normalizeFromLegacy(raw: JupiterTokenLegacy[]): Token[] {
  return raw
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
}

// Common fetch options:
//   - cache: "no-store" bypasses Next's data cache so a previous failed
//     fetch can't poison our results for an hour
//   - User-Agent identifies us cleanly so lite-api doesn't reject us as
//     an anonymous bot client
const fetchOpts: RequestInit = {
  headers: {
    Accept: "application/json",
    "User-Agent": "tknz/1.0 (+https://tknz.xyz; +https://github.com/retroservices1121/tknzswap)",
  },
  cache: "no-store",
};

async function fetchV2(): Promise<Token[]> {
  const res = await fetch(JUPITER_VERIFIED, fetchOpts);
  if (!res.ok) throw new Error(`Jupiter V2 ${res.status} ${res.statusText}`);
  const raw = (await res.json()) as JupiterTokenV2[];
  if (!Array.isArray(raw)) throw new Error("Jupiter V2 returned non-array");
  return normalizeFromV2(raw);
}

async function fetchLegacy(): Promise<Token[]> {
  const res = await fetch(JUPITER_LEGACY, fetchOpts);
  if (!res.ok) throw new Error(`Jupiter legacy ${res.status} ${res.statusText}`);
  const raw = (await res.json()) as JupiterTokenLegacy[];
  if (!Array.isArray(raw)) throw new Error("Jupiter legacy returned non-array");
  return normalizeFromLegacy(raw);
}

export async function getSolanaTokenRegistry(): Promise<Token[]> {
  // Honor cache only if it has real content. Empty arrays are not cached
  // — that prevents a single failed-fetch-cached-as-success from sticking
  // for an hour.
  if (cache && cache.tokens.length > 0 && Date.now() - cache.fetchedAt < ONE_HOUR_MS) {
    return cache.tokens;
  }

  let tokens: Token[] = [];
  let lastErr: unknown = null;

  try {
    tokens = await fetchV2();
  } catch (err) {
    lastErr = err;
  }

  if (tokens.length === 0) {
    try {
      tokens = await fetchLegacy();
    } catch (err) {
      lastErr = err;
    }
  }

  if (tokens.length === 0) {
    if (cache && cache.tokens.length > 0) return cache.tokens;
    throw lastErr instanceof Error ? lastErr : new Error("Jupiter registry unavailable");
  }

  cache = { fetchedAt: Date.now(), tokens };
  return tokens;
}
