import "server-only";
import { createConfig, getRoutes, ChainId as LifiChainId, type Route as LifiRoute } from "@lifi/sdk";
import { LIFI_FEE_FLOAT } from "./fee";
import { sortRoutes, assignBadges } from "./sort";
import type { SortDimension } from "@/types/swap";
import type { UnifiedRoute, RouteVenue } from "@/types/route";

let configured = false;

function ensureConfig() {
  if (configured) return;
  configured = true;
  createConfig({
    integrator: process.env.LIFI_INTEGRATOR ?? "tknz",
    apiKey: process.env.LIFI_API_KEY,
    rpcUrls: {
      [LifiChainId.ETH]: [process.env.NEXT_PUBLIC_ETH_RPC ?? "https://eth.llamarpc.com"],
      [LifiChainId.ARB]: [process.env.NEXT_PUBLIC_ARB_RPC ?? "https://arb1.arbitrum.io/rpc"],
      [LifiChainId.BAS]: [process.env.NEXT_PUBLIC_BASE_RPC ?? "https://mainnet.base.org"],
      [LifiChainId.OPT]: [process.env.NEXT_PUBLIC_OP_RPC ?? "https://mainnet.optimism.io"],
      [LifiChainId.POL]: [process.env.NEXT_PUBLIC_POLYGON_RPC ?? "https://polygon-rpc.com"],
    },
  });
}

export interface EvmQuoteParams {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;     // raw token units, smallest denom
  walletAddress: string;  // REQUIRED — Li.Fi returns no routes without it
  sortBy?: SortDimension;
}

const VENUES_BLUE: RouteVenue[] = [
  { label: "1I", bg: "#60A5FA" },
  { label: "UN", bg: "#FF5B5B" },
  { label: "0X", bg: "#8A95A3" },
];

function pickVenues(stepCount: number): RouteVenue[] {
  return VENUES_BLUE.slice(0, Math.min(3, Math.max(2, stepCount)));
}

function readableAmount(raw: string, decimals: number): number {
  if (!raw) return 0;
  try {
    const big = BigInt(raw);
    const div = 10n ** BigInt(decimals);
    const whole = big / div;
    const frac = big % div;
    return Number(whole) + Number(frac) / Number(div);
  } catch {
    return 0;
  }
}

function toUnified(r: LifiRoute): UnifiedRoute {
  // Li.Fi returns gasCostUSD as a string aggregated across steps in many SDK versions;
  // fall back to summing step-level gas costs.
  const gasCostUSD = r.gasCostUSD
    ? parseFloat(r.gasCostUSD as unknown as string)
    : (r.steps ?? []).reduce((sum, s) => {
        const g = s.estimate?.gasCosts?.[0]?.amountUSD;
        return sum + (g ? parseFloat(g) : 0);
      }, 0);

  const duration = (r.steps ?? []).reduce(
    (sum, s) => sum + (s.estimate?.executionDuration ?? 0),
    0
  );

  const toAmountReadable = readableAmount(r.toAmount, r.toToken.decimals);
  const fromAmountReadable = readableAmount(r.fromAmount, r.fromToken.decimals);
  const toAmountUSD = r.toAmountUSD ? parseFloat(r.toAmountUSD as unknown as string) : toAmountReadable;
  const fromAmountUSD = r.fromAmountUSD ? parseFloat(r.fromAmountUSD as unknown as string) : fromAmountReadable;

  const toolNames = (r.steps ?? []).map((s) => (s.toolDetails?.name ?? s.tool ?? "").toUpperCase()).filter(Boolean);
  const pathLabel = toolNames.length ? toolNames.slice(0, 3).join(" → ") : "DIRECT";

  return {
    id: r.id,
    layer: "lifi",
    toAmount: r.toAmount,
    toAmountReadable,
    toAmountUSD,
    fromAmountUSD,
    estimatedDurationSeconds: duration || 30,
    gasCostUSD: gasCostUSD || 0,
    venues: pickVenues(r.steps?.length ?? 2),
    pathLabel,
    badge: null,
    raw: r,
  };
}

export async function fetchEvmRoutes(params: EvmQuoteParams): Promise<UnifiedRoute[]> {
  ensureConfig();

  if (params.fromChainId === 0 || params.toChainId === 0) {
    throw new Error("fetchEvmRoutes called with Solana chain — use DFlow instead");
  }

  const result = await getRoutes({
    fromChainId: params.fromChainId,
    toChainId: params.toChainId,
    fromTokenAddress: params.fromToken,
    toTokenAddress: params.toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.walletAddress,
    options: {
      // CRITICAL: fee is a FLOAT not basis points
      // 0.0015 = 0.15%. Never pass 15 or 0.15.
      fee: LIFI_FEE_FLOAT,
      integrator: process.env.LIFI_INTEGRATOR ?? "tknz",
    },
  });

  const unified = result.routes.map(toUnified);
  const sorted = sortRoutes(unified, params.sortBy ?? "price");
  return assignBadges(sorted);
}
