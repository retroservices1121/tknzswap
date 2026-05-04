"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function SolanaConnectButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  if (publicKey) {
    const addr = publicKey.toBase58();
    const short = addr.slice(0, 4) + "…" + addr.slice(-4);
    return (
      <button
        className="connect-btn"
        onClick={() => disconnect()}
        type="button"
        style={{ color: "var(--accent)" }}
      >
        {short}
      </button>
    );
  }

  return (
    <button className="connect-btn" onClick={() => setVisible(true)} type="button" disabled={connecting}>
      {connecting ? "Connecting…" : "Connect Solana"}
    </button>
  );
}
