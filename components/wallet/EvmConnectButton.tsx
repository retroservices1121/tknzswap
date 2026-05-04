"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

// Wraps RainbowKit's ConnectButton.Custom in our nav-style button.
export function EvmConnectButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return (
            <button className="connect-btn" onClick={openConnectModal} type="button">
              Connect EVM
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button className="connect-btn" onClick={openChainModal} type="button" style={{ color: "var(--red)" }}>
              Wrong network
            </button>
          );
        }

        return (
          <button className="connect-btn" onClick={openAccountModal} type="button">
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
