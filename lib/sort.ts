import type { UnifiedRoute, RouteBadge } from "@/types/route";
import type { SortDimension } from "@/types/swap";

// Routes must NEVER be sorted editorially.
// Allowed dimensions: price (output amount), speed, gas.
export function sortRoutes(routes: UnifiedRoute[], by: SortDimension): UnifiedRoute[] {
  return [...routes].sort((a, b) => {
    switch (by) {
      case "price": return b.toAmountUSD - a.toAmountUSD;
      case "speed": return a.estimatedDurationSeconds - b.estimatedDurationSeconds;
      case "gas":   return a.gasCostUSD - b.gasCostUSD;
    }
  });
}

// Badges are DATA-DERIVED only. Never hardcode which route gets a badge.
export function assignBadges(routes: UnifiedRoute[]): UnifiedRoute[] {
  if (routes.length === 0) return routes;
  const byPrice = sortRoutes(routes, "price");
  const bySpeed = sortRoutes(routes, "speed");
  const byGas = sortRoutes(routes, "gas");

  return routes.map((r) => {
    let badge: RouteBadge | null = null;
    if (r.id === byPrice[0].id) badge = "best";
    else if (r.id === bySpeed[0].id) badge = "fastest";
    else if (r.id === byGas[0].id) badge = "cheap";
    return { ...r, badge };
  });
}
