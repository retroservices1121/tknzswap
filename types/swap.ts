import type { Token } from "./token";

export type SortDimension = "price" | "speed" | "gas";

export interface SwapState {
  from: Token | null;
  to: Token | null;
  amount: string; // human-readable, what the user typed
  sort: SortDimension;
  selectedRouteId: string | null;
  slippageBps: number; // 10, 50, 100 → 0.1%, 0.5%, 1.0%
  mev: "ENABLED" | "DISABLED";
}

export type ModalState =
  | null
  | { type: "token"; side: "from" | "to" }
  | { type: "settings" };
