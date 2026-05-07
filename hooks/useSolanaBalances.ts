"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

// Standard SPL token program + the newer Token-2022 program. We query both
// so that newer mints (PYUSD, etc.) show up alongside legacy SPL balances.
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const TOKEN_2022_PROGRAM_ID = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const WSOL_MINT = "So11111111111111111111111111111111111111112";

export type BalanceMap = Map<string, number>;

export function useSolanaBalances() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  return useQuery<BalanceMap>({
    queryKey: ["solana-balances", publicKey?.toBase58() ?? null],
    enabled: !!publicKey,
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const map: BalanceMap = new Map();
      if (!publicKey) return map;

      const [lamports, splV1, splV2] = await Promise.all([
        connection.getBalance(publicKey),
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID }),
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID }),
      ]);

      // Native SOL is keyed under the wSOL mint so the swap UI's SOL token
      // (which uses the wSOL mint as its sentinel) finds it.
      map.set(WSOL_MINT, lamports / LAMPORTS_PER_SOL);

      const collect = (accounts: Awaited<ReturnType<typeof connection.getParsedTokenAccountsByOwner>>) => {
        for (const { account } of accounts.value) {
          const info = (account.data as { parsed: { info: { mint: string; tokenAmount: { uiAmount: number | null } } } }).parsed.info;
          const mint = info.mint;
          const amount = info.tokenAmount.uiAmount ?? 0;
          if (amount > 0) map.set(mint, amount);
        }
      };
      collect(splV1);
      collect(splV2);

      return map;
    },
  });
}
