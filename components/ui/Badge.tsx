import type { RouteBadge } from "@/types/route";

export function Badge({ variant, children }: { variant: RouteBadge; children: React.ReactNode }) {
  return <span className={`route-badge ${variant}`}>{children}</span>;
}

export function badgeLabel(b: RouteBadge): string {
  return b === "best" ? "BEST PRICE" : b === "fastest" ? "FASTEST" : "LOW GAS";
}
