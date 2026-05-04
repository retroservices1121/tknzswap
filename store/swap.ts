import { create } from "zustand";
import type { SwapState, ModalState, SortDimension } from "@/types/swap";
import type { Token } from "@/types/token";
import { SOLANA_TOKENS } from "@/lib/tokens";

interface SwapStore extends SwapState {
  modal: ModalState;
  setFrom: (t: Token | null) => void;
  setTo: (t: Token | null) => void;
  setAmount: (a: string) => void;
  setSort: (s: SortDimension) => void;
  setSelectedRoute: (id: string | null) => void;
  setSlippageBps: (b: number) => void;
  setMev: (m: "ENABLED" | "DISABLED") => void;
  flip: () => void;
  openModal: (m: ModalState) => void;
  closeModal: () => void;
}

const sol = SOLANA_TOKENS.find((t) => t.symbol === "SOL") ?? null;
const usdcSol = SOLANA_TOKENS.find((t) => t.symbol === "USDC") ?? null;

export const useSwapStore = create<SwapStore>((set) => ({
  from: sol,
  to: usdcSol,
  amount: "",
  sort: "price",
  selectedRouteId: null,
  slippageBps: 50,
  mev: "ENABLED",
  modal: null,

  setFrom: (t) => set({ from: t, selectedRouteId: null }),
  setTo: (t) => set({ to: t, selectedRouteId: null }),
  setAmount: (a) => set({ amount: a, selectedRouteId: null }),
  setSort: (s) => set({ sort: s }),
  setSelectedRoute: (id) => set({ selectedRouteId: id }),
  setSlippageBps: (b) => set({ slippageBps: b }),
  setMev: (m) => set({ mev: m }),
  flip: () => set((s) => ({ from: s.to, to: s.from, amount: "", selectedRouteId: null })),
  openModal: (m) => set({ modal: m }),
  closeModal: () => set({ modal: null }),
}));
