"use client";

import { EvmProvider } from "./EvmProvider";
import { SolanaProvider } from "./SolanaProvider";
import { TokenModal } from "@/components/modals/TokenModal";
import { SettingsModal } from "@/components/modals/SettingsModal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EvmProvider>
      <SolanaProvider>
        {children}
        <TokenModal />
        <SettingsModal />
      </SolanaProvider>
    </EvmProvider>
  );
}
