"use client";

import { useState } from "react";
import { useWalletClient } from "wagmi";
import { executeRoute, type Route as LifiRoute } from "@lifi/sdk";

export function useEvmSwap() {
  const { data: walletClient } = useWalletClient();
  const [isSwapping, setIsSwapping] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeEvmSwap(route: LifiRoute) {
    if (!walletClient) throw new Error("EVM wallet not connected");

    setIsSwapping(true);
    setError(null);

    try {
      const result = await executeRoute(route, {
        // Li.Fi handles approvals + execution. Finite approvals stay on by default.
        updateRouteHook: () => {},
      });

      const lastStep = result.steps[result.steps.length - 1];
      const hash =
        lastStep.execution?.process.find((p) => p.txHash)?.txHash ?? null;

      setTxHash(hash);
      return hash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      setError(msg);
      throw err;
    } finally {
      setIsSwapping(false);
    }
  }

  return { executeEvmSwap, isSwapping, txHash, error };
}
