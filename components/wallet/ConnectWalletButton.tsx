"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { IconClose } from "@/components/ui/Icons";

// Single entry-point button. When neither wallet is connected, opens a
// chooser modal letting the user pick EVM (RainbowKit) or Solana.
// When one or both are connected, summarizes the connection in the button
// and opens a manage-connections modal on click.
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
    if (evmShort && solShort) return "2 wallets connected";
    if (evmShort) return evmShort;
    if (solShort) return solShort;
    return "Connect wallet";
  })();

  return (
    <ConnectButton.Custom>
      {({ openConnectModal: openEvmModal, mounted }) => (
        <>
          <button
            type="button"
            className="connect-btn"
            onClick={() => setOpen(true)}
            disabled={!mounted}
            style={
              evmShort && !solShort
                ? { color: "var(--blue)" }
                : solShort && !evmShort
                ? { color: "var(--accent)" }
                : undefined
            }
          >
            {buttonLabel}
          </button>

          {open && (
            <div className="modal-backdrop" onClick={() => setOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: 420 }}>
                <div className="modal-head">
                  <span className="modal-title">
                    {evmShort || solShort ? "Manage wallets" : "Connect wallet"}
                  </span>
                  <button className="modal-close" onClick={() => setOpen(false)} type="button">
                    <IconClose />
                  </button>
                </div>

                <div className="settings-body">
                  <div className="setting-group">
                    <div className="setting-label">EVM (Li.Fi)</div>
                    <WalletRow
                      color="blue"
                      address={evmShort}
                      onConnect={() => {
                        setOpen(false);
                        openEvmModal();
                      }}
                      onDisconnect={() => disconnectEvm()}
                    />
                  </div>

                  <div className="setting-group">
                    <div className="setting-label">
                      <span className="brand-solana">Solana</span> (
                      <span className="brand-dflow">DFlow</span>)
                    </div>
                    <WalletRow
                      color="green"
                      address={solShort}
                      onConnect={() => {
                        setOpen(false);
                        openSolModal(true);
                      }}
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
                    Connect both to swap on either layer without reconnecting. tknz
                    never custodies — every transaction is signed in your wallet.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
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
