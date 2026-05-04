"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

export function useSolanaSwap() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [isSwapping, setIsSwapping] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeSwap(quoteResponse: object) {
    if (!publicKey || !signTransaction) {
      throw new Error("Solana wallet not connected");
    }

    setIsSwapping(true);
    setError(null);

    try {
      // 1. Ask the server for the swap tx (DFlow returns base64 VersionedTransaction).
      const res = await fetch("/api/solana/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toBase58(),
        }),
      });
      if (!res.ok) throw new Error(`Swap API error: ${res.status}`);
      const { swapTransaction } = (await res.json()) as { swapTransaction: string };

      // 2. Deserialize.
      const txBuffer = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(txBuffer);

      // 3. Sign with the user's wallet.
      const signed = await signTransaction(transaction);

      // 4. Send raw transaction to Solana (skip preflight for Jito bundles).
      const rawTx = signed.serialize();
      const signature = await connection.sendRawTransaction(rawTx, {
        skipPreflight: true,
        maxRetries: 3,
      });

      // 5. Confirm.
      const latest = await connection.getLatestBlockhash();
      const { value } = await connection.confirmTransaction(
        { signature, ...latest },
        "confirmed"
      );

      if (value.err) throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);

      setTxid(signature);
      return signature;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      setError(msg);
      throw err;
    } finally {
      setIsSwapping(false);
    }
  }

  return { executeSwap, isSwapping, txid, error };
}
