// Unified route shape used by the SwapCard UI. Wraps both Li.Fi and DFlow quote responses.

export interface RouteVenue {
  label: string; // 2-letter venue code shown in stacked circles
  bg: string;    // hex background
}

export type RouteBadge = "best" | "fastest" | "cheap";

export interface UnifiedRoute {
  id: string;
  layer: "lifi" | "dflow" | "mayan";

  // Display
  toAmount: string;          // raw token units in smallest denom
  toAmountReadable: number;  // converted to human-readable
  toAmountUSD: number;
  fromAmountUSD: number;

  // Sortable dimensions
  estimatedDurationSeconds: number;
  gasCostUSD: number;

  // Visual
  venues: RouteVenue[];
  pathLabel: string;
  badge?: RouteBadge | null;

  // Underlying engine payload (passed back to swap APIs)
  raw: unknown;
}
