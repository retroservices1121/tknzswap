"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";

import {
  sendJitoBundle,
  encodeTxBase58,
  waitForBundleLanding,
} from "@/lib/jito";

export function useSolanaSwap() {
  const { publicKey, signTransaction } = useWallet();
  const [isSwapping, setIsSwapping] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [bundleId, setBundleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeSwap(quoteResponse: object) {
    if (!publicKey || !signTransaction) {
      throw new Error("Solana wallet not connected");
    }

    setIsSwapping(true);
    setError(null);
    setBundleId(null);

    try {
      // 1. Get the swap tx from DFlow (server proxy). DFlow bakes a Jito tip
      //    instruction into this transaction because we requested forJitoBundle=true.
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

      // 2. Deserialize the base64 VersionedTransaction.
      const txBuffer = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(txBuffer);

      // 3. Sign with the user's wallet (user approves in wallet UI).
      const signed = await signTransaction(transaction);
      const rawTx = signed.serialize();

      // The first signature is the canonical txid for the inner swap transaction.
      const expectedSignature = bs58.encode(signed.signatures[0]);

      // 4. Submit to Jito Block Engine as a bundle. This guarantees:
      //    - No front-running by the block engine itself
      //    - Atomic landing
      //    - Bundle-status feedback
      const submittedBundleId = await sendJitoBundle(encodeTxBase58(rawTx));
      setBundleId(submittedBundleId);

      // 5. Poll the Block Engine for landing confirmation.
      const landedSignature = await waitForBundleLanding(
        submittedBundleId,
        expectedSignature
      );

      setTxid(landedSignature);
      return landedSignature;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      setError(msg);
      throw err;
    } finally {
      setIsSwapping(false);
    }
  }

  return { executeSwap, isSwapping, txid, bundleId, error };
}
