"use client";

import { useEffect, useRef, useState } from "react";
import { useSwapStore } from "@/store/swap";
import { ALL_TOKENS } from "@/lib/tokens";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { IconClose, IconSearch } from "@/components/ui/Icons";
import { fmtAmt, fmtUSD } from "@/lib/format";
import type { Token } from "@/types/token";

type ChainFilter = "all" | "sol" | "evm";

const FILTERS: Array<{ id: ChainFilter; label: React.ReactNode; color: "neutral" | "green" | "blue" }> = [
  { id: "all", label: "All chains", color: "neutral" },
  { id: "sol", label: <span className="brand-solana">Solana</span>, color: "green" },
  { id: "evm", label: "EVM", color: "blue" },
];

export function TokenModal() {
  const { modal, closeModal, setFrom, setTo } = useSwapStore();
  const [q, setQ] = useState("");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = modal?.type === "token";
  const side = open ? modal.side : null;

  useEffect(() => {
    if (open) {
      setQ("");
      setChainFilter("all");
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  if (!open) return null;

  const filtered = ALL_TOKENS.filter((t) => {
    if (chainFilter === "sol" && t.chainId !== "solana") return false;
    if (chainFilter === "evm" && t.chainId === "solana") return false;
    if (!q) return true;
    const needle = q.toLowerCase();
    return (
      t.symbol.toLowerCase().includes(needle) ||
      t.name.toLowerCase().includes(needle) ||
      t.address.toLowerCase().includes(needle)
    );
  });

  const onPick = (t: Token) => {
    if (side === "from") setFrom(t);
    else if (side === "to") setTo(t);
    closeModal();
  };

  return (
    <div className="modal-backdrop" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">Select token</span>
          <button className="modal-close" onClick={closeModal} type="button">
            <IconClose />
          </button>
        </div>
        <div className="search-box">
          <span style={{ color: "var(--text3)" }}>
            <IconSearch />
          </span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or paste address"
          />
        </div>
        <div className="chain-filter">
          {FILTERS.map((c) => (
            <button
              key={c.id}
              className={"chain-pill " + (chainFilter === c.id ? `active ${c.color}` : "")}
              onClick={() => setChainFilter(c.id)}
              type="button"
            >
              {c.color !== "neutral" && <span className="glyph">{c.id === "sol" ? "S" : "E"}</span>}
              {c.label}
            </button>
          ))}
        </div>
        <div className="token-list">
          {filtered.map((t, i) => (
            <div key={t.symbol + String(t.chainId) + i} className="token-row" onClick={() => onPick(t)}>
              <TokenIcon tok={t} size={34} />
              <div className="token-row-main">
                <div className="sym">{t.symbol}</div>
                <div className="name">
                  <span className={"chain-tag " + (t.chainId === "solana" ? "sol" : "evm")}>
                    {t.chainId === "solana" ? "SOL" : `EVM ${t.chainId}`}
                  </span>
                  {t.name}
                </div>
              </div>
              <div className="token-row-right">
                <div className="bal">{fmtAmt(t.bal ?? 0, t.symbol === "BONK" ? 0 : 4)}</div>
                <div className="usd">{fmtUSD((t.bal ?? 0) * (t.usd ?? 0))}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "40px 0",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              No tokens match
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
