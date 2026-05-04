"use client";

// Lightweight balance hook. Returns 0 when wallet isn't connected so the UI
// renders deterministically. Real implementations should fetch via wagmi
// (useBalance / useReadContracts) for EVM and getParsedTokenAccountsByOwner
// for Solana. Kept thin so the build stays self-contained.

import { useAccount, useBalance } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Token } from "@/types/token";

export function useTokenBalance(token: Token | null) {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();

  const isNativeEvm = token?.address === "0x0000000000000000000000000000000000000000";
  const isEvm = !!token && token.chainId !== "solana";

  const evmQuery = useBalance({
    address: evmAddress,
    chainId: isEvm ? (token!.chainId as number) : undefined,
    token: isEvm && !isNativeEvm ? (token!.address as `0x${string}`) : undefined,
    query: { enabled: !!token && isEvm && !!evmAddress },
  });

  if (!token) return { balance: 0, connected: false };

  if (token.chainId === "solana") {
    // Real impl: fetch SPL balance via @solana/web3.js getParsedTokenAccountsByOwner
    return { balance: 0, connected: !!publicKey };
  }

  const formatted = evmQuery.data?.formatted ? parseFloat(evmQuery.data.formatted) : 0;
  return { balance: formatted, connected: !!evmAddress };
}
