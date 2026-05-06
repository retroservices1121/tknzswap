"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import {
  swapFromEvm,
  swapFromSolana,
  type Quote,
  type ReferrerAddresses,
} from "@mayanfinance/swap-sdk";
import type { WalletClient } from "viem";

// Bridge a viem wallet client (wagmi) to an ethers v6 Signer for Mayan SDK.
function walletClientToEthersSigner(walletClient: WalletClient): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  if (!account || !chain) throw new Error("Wallet client missing account or chain");
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  // BrowserProvider wraps any EIP-1193 transport.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = new BrowserProvider(transport as any, network);
  return new JsonRpcSigner(provider, account.address);
}

export function useCrossSwap() {
  const { address: evmAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { publicKey: solPubkey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [isSwapping, setIsSwapping] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function executeCrossSwap(quote: Quote) {
    setIsSwapping(true);
    setError(null);

    const referrerAddresses: ReferrerAddresses = {
      evm: process.env.NEXT_PUBLIC_MAYAN_REFERRER_EVM ?? null,
      solana: process.env.NEXT_PUBLIC_MAYAN_REFERRER_SOLANA ?? null,
    };

    try {
      const fromIsSolana = quote.fromChain === "solana";

      if (fromIsSolana) {
        if (!solPubkey || !signTransaction) {
          throw new Error("Solana wallet not connected");
        }
        if (!evmAddress) {
          throw new Error("EVM wallet not connected — required as cross-VM destination");
        }
        const result = await swapFromSolana(
          quote,
          solPubkey.toBase58(),
          evmAddress,
          referrerAddresses,
          signTransaction
        );
        setTxid(result.signature);
        return result.signature;
      }

      // From EVM → Solana.
      if (!walletClient || !evmAddress) {
        throw new Error("EVM wallet not connected");
      }
      if (!solPubkey) {
        throw new Error("Solana wallet not connected — required as cross-VM destination");
      }
      const signer = walletClientToEthersSigner(walletClient);
      const result = await swapFromEvm(
        quote,
        evmAddress,
        solPubkey.toBase58(),
        referrerAddresses,
        signer,
        null,
        null,
        null
      );
      const hash = typeof result === "string" ? result : result.hash;
      setTxid(hash);
      return hash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cross-VM swap failed";
      setError(msg);
      throw err;
    } finally {
      setIsSwapping(false);
    }
  }

  return {
    executeCrossSwap,
    isSwapping,
    txid,
    error,
    // True when the user has both wallets connected — required for any cross-VM swap.
    bothWalletsReady: !!evmAddress && !!solPubkey,
  };
}
