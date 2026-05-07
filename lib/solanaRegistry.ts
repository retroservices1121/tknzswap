import "server-only";
import type { Token } from "@/types/token";

// Jupiter Tokens V2 API — the de facto curated Solana token list.
// "verified" tag endpoint returns Solana tokens that pass Jupiter's quality
// criteria. DFlow's market makers can route against effectively the same
// universe (any SPL with on-chain liquidity Jupiter has indexed).
//
// We use the lite-api variant which does not require an API key, so the
// service works in any deployment environment without secret configuration.
// The authenticated variant is `https://api.jup.ag/...` with x-api-key header.
const JUPITER_VERIFIED = "https://lite-api.jup.ag/tokens/v2/tag?query=verified";

// Fallback for the older endpoint shape (some upstream caches still serve it).
const JUPITER_LEGACY = "https://tokens.jup.ag/tokens?tags=verified";

// V2 schema — id is the mint address, icon is the logo URL.
interface JupiterTokenV2 {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  icon?: string;
  tags?: string[];
  isVerified?: boolean;
}

// Legacy schema — address is the mint address, logoURI is the logo URL.
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

async function fetchV2(): Promise<Token[]> {
  const res = await fetch(JUPITER_VERIFIED, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jupiter V2 ${res.status}`);
  const raw = (await res.json()) as JupiterTokenV2[];
  return normalizeFromV2(raw);
}

async function fetchLegacy(): Promise<Token[]> {
  const res = await fetch(JUPITER_LEGACY, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Jupiter legacy ${res.status}`);
  const raw = (await res.json()) as JupiterTokenLegacy[];
  return normalizeFromLegacy(raw);
}

export async function getSolanaTokenRegistry(): Promise<Token[]> {
  if (cache && Date.now() - cache.fetchedAt < ONE_HOUR_MS) {
    return cache.tokens;
  }

  // Try V2 first, fall back to the legacy endpoint shape if V2 is unavailable.
  let tokens: Token[] = [];
  try {
    tokens = await fetchV2();
  } catch (err) {
    try {
      tokens = await fetchLegacy();
    } catch {
      if (cache) return cache.tokens;
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  cache = { fetchedAt: Date.now(), tokens };
  return tokens;
}
