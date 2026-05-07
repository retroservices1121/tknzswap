"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { IconClose } from "@/components/ui/Icons";

// Single-active-wallet pattern. Connecting one wallet disconnects the
// other. Cross-VM swaps via Mayan still work — the user supplies a
// destination address manually in the swap card.
export function ConnectWalletButton() {
  const [open, setOpen] = useState(false);

  const { address: evmAddress } = useAccount();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { publicKey: solPubkey, disconnect: disconnectSol } = useWallet();
  const { setVisible: openSolModal } = useWalletModal();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const evmShort = evmAddress
    ? evmAddress.slice(0, 6) + "…" + evmAddress.slice(-4)
    : null;
  const solShort = solPubkey
    ? solPubkey.toBase58().slice(0, 4) + "…" + solPubkey.toBase58().slice(-4)
    : null;

  const buttonLabel = (() => {
    if (evmShort) return evmShort;
    if (solShort) return solShort;
    return "Connect wallet";
  })();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal: openEvmModal, mounted }) => {
        const handleConnectEvm = () => {
          // Single-active-wallet pattern: disconnect Solana before EVM
          // connect dialog opens, so we never end up with two active.
          if (solPubkey) disconnectSol();
          setOpen(false);
          openEvmModal();
        };

        const handleConnectSol = () => {
          if (evmAddress) disconnectEvm();
          setOpen(false);
          openSolModal(true);
        };

        return (
          <>
            <button
              type="button"
              className="connect-btn"
              onClick={() => setOpen(true)}
              disabled={!mounted}
              style={
                evmShort
                  ? { color: "var(--blue)" }
                  : solShort
                    ? { color: "var(--accent)" }
                    : undefined
              }
            >
              {buttonLabel}
            </button>

            {open && (
              <div className="modal-backdrop" onClick={() => setOpen(false)}>
                <div
                  className="modal"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 420, maxWidth: "calc(100vw - 24px)" }}
                >
                  <div className="modal-head">
                    <span className="modal-title">
                      {evmShort || solShort ? "Manage wallet" : "Connect wallet"}
                    </span>
                    <button className="modal-close" onClick={() => setOpen(false)} type="button">
                      <IconClose />
                    </button>
                  </div>

                  <div className="settings-body">
                    <div className="setting-group">
                      <div className="setting-label">EVM</div>
                      <WalletRow
                        color="blue"
                        address={evmShort}
                        onConnect={handleConnectEvm}
                        onDisconnect={() => disconnectEvm()}
                      />
                    </div>

                    <div className="setting-group">
                      <div className="setting-label">
                        <span className="brand-solana">Solana</span>
                      </div>
                      <WalletRow
                        color="green"
                        address={solShort}
                        onConnect={handleConnectSol}
                        onDisconnect={() => disconnectSol()}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 18,
                        padding: "12px 14px",
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        lineHeight: 1.6,
                        color: "var(--text3)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      One wallet at a time. Switching auto-disconnects the previous
                      wallet. For cross-VM swaps (EVM ↔ Solana), enter a destination
                      address in the swap card. tknz never custodies — every
                      transaction is signed in your wallet.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}

function WalletRow({
  color,
  address,
  onConnect,
  onDisconnect,
}: {
  color: "blue" | "green";
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const accentVar = color === "blue" ? "var(--blue)" : "var(--accent)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      <span
        className="glyph"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: address ? accentVar : "var(--text3)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: address ? "var(--text)" : "var(--text2)",
          letterSpacing: "0.02em",
        }}
      >
        {address ?? "Not connected"}
      </span>
      <button
        type="button"
        className="connect-btn"
        style={{
          height: 28,
          padding: "0 12px",
          fontSize: 11,
          color: address ? "var(--text2)" : accentVar,
        }}
        onClick={address ? onDisconnect : onConnect}
      >
        {address ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
}
