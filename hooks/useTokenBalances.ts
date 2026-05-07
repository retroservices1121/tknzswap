"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolanaBalances } from "@/hooks/useSolanaBalances";
import type { Token } from "@/types/token";

const NATIVE_EVM = "0x0000000000000000000000000000000000000000";

export function useTokenBalance(token: Token | null) {
  const { address: evmAddress } = useAccount();
  const { publicKey } = useWallet();
  const { data: solBalances } = useSolanaBalances();

  const isNativeEvm = token?.address === NATIVE_EVM;
  const isEvm = !!token && token.chainId !== "solana";

  const evmQuery = useBalance({
    address: evmAddress,
    chainId: isEvm ? (token!.chainId as number) : undefined,
    token: isEvm && !isNativeEvm ? (token!.address as `0x${string}`) : undefined,
    query: { enabled: !!token && isEvm && !!evmAddress },
  });

  if (!token) return { balance: 0, connected: false };

  if (token.chainId === "solana") {
    const balance = solBalances?.get(token.address) ?? 0;
    return { balance, connected: !!publicKey };
  }

  const formatted = evmQuery.data?.formatted ? parseFloat(evmQuery.data.formatted) : 0;
  return { balance: formatted, connected: !!evmAddress };
}
