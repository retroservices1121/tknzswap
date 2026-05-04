"use client";

import { useEffect } from "react";
import { useSwapStore } from "@/store/swap";
import { IconClose } from "@/components/ui/Icons";
import { ALL_CHAINS } from "@/lib/chains";
import { SOLANA_TOKENS, EVM_TOKENS } from "@/lib/tokens";
import type { Token } from "@/types/token";

const SLIPPAGE_OPTIONS: Array<{ bps: number; label: string }> = [
  { bps: 10, label: "0.1%" },
  { bps: 50, label: "0.5%" },
  { bps: 100, label: "1.0%" },
];

const MEV_OPTIONS = ["ENABLED", "DISABLED"] as const;

export function SettingsModal() {
  const { modal, closeModal, slippageBps, setSlippageBps, mev, setMev, setFrom, setTo } = useSwapStore();
  const open = modal?.type === "settings";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  if (!open) return null;

  // Default-network selector — picks sensible from/to for that chain.
  const switchChain = (chainId: number | "solana") => {
    const pool: Token[] = chainId === "solana" ? SOLANA_TOKENS : EVM_TOKENS.filter((t) => t.chainId === chainId);
    if (pool.length === 0) return;
    const fromT = pool[0];
    const toT = pool.find((t) => t.symbol === "USDC" && t.address !== fromT.address) ?? pool.find((t) => t.address !== fromT.address) ?? null;
    setFrom(fromT);
    if (toT) setTo(toT);
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Settings</span>
          <button className="modal-close" onClick={closeModal} type="button">
            <IconClose />
          </button>
        </div>
        <div className="settings-body">
          <div className="setting-group">
            <div className="setting-label">Max slippage</div>
            <div className="slip-row">
              {SLIPPAGE_OPTIONS.map((s) => (
                <button
                  key={s.bps}
                  className={"slip-opt " + (slippageBps === s.bps ? "active" : "")}
                  onClick={() => setSlippageBps(s.bps)}
                  type="button"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">Default network</div>
            <div className="net-grid">
              {ALL_CHAINS.map((c) => {
                const isSol = c.id === "solana";
                return (
                  <button
                    key={String(c.id)}
                    className={"net-opt " + (isSol ? "active green" : "")}
                    onClick={() => switchChain(c.id)}
                    type="button"
                  >
                    <span
                      className="glyph"
                      style={{ background: isSol ? "var(--accent)" : "var(--blue)" }}
                    />
                    {isSol ? <span className="brand-solana">Solana</span> : c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="setting-group">
            <div className="setting-label">MEV protection</div>
            <div className="slip-row">
              {MEV_OPTIONS.map((v) => (
                <button
                  key={v}
                  className={"slip-opt " + (mev === v ? "active" : "")}
                  onClick={() => setMev(v)}
                  type="button"
                >
                  {v}
                </button>
              ))}
            </div>
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
            Settings apply to the current session. Network selection determines which execution engine
            routes the order: <span className="brand-dflow">DFlow</span> for{" "}
            <span className="brand-solana">Solana</span>, <span className="brand-lifi">Li.Fi</span>{" "}
            for EVM chains.
          </div>
        </div>
      </div>
    </div>
  );
}
