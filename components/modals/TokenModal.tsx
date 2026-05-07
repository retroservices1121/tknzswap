"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSwapStore } from "@/store/swap";
import { EVM_TOKENS, SOLANA_TOKENS } from "@/lib/tokens";
import { useSolanaTokenRegistry } from "@/hooks/useSolanaTokenRegistry";
import { useSolanaBalances } from "@/hooks/useSolanaBalances";
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

const SOLANA_MINT_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const RENDER_LIMIT = 120;

function dedupeByMint(tokens: Token[]): Token[] {
  const seen = new Set<string>();
  const out: Token[] = [];
  for (const t of tokens) {
    const key = `${t.chainId}:${t.address.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export function TokenModal() {
  const { modal, closeModal, setFrom, setTo } = useSwapStore();
  const [q, setQ] = useState("");
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: registry, isLoading: registryLoading } = useSolanaTokenRegistry();
  const { data: solBalances } = useSolanaBalances();

  const balanceFor = (t: Token): number => {
    if (t.chainId === "solana") return solBalances?.get(t.address) ?? 0;
    return t.bal ?? 0;
  };

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

  // Featured tokens (the curated 8) come first, then the full Jupiter registry,
  // deduped on mint. EVM is the static list — Li.Fi has its own quote-time
  // resolution and we don't need a live registry for it today.
  const universe: Token[] = useMemo(() => {
    if (chainFilter === "evm") return EVM_TOKENS;
    const sol = dedupeByMint([...SOLANA_TOKENS, ...(registry ?? [])]);
    if (chainFilter === "sol") return sol;
    return [...sol, ...EVM_TOKENS];
  }, [chainFilter, registry]);

  const filtered: Token[] = useMemo(() => {
    const needle = q.toLowerCase().trim();
    const matched = needle
      ? universe.filter(
          (t) =>
            t.symbol.toLowerCase().includes(needle) ||
            t.name.toLowerCase().includes(needle) ||
            t.address.toLowerCase().includes(needle)
        )
      : universe;

    // Tokens the user actually holds float to the top, sorted by balance.
    // Then everything else in original (featured-first) order.
    const balOf = (t: Token): number =>
      t.chainId === "solana" ? solBalances?.get(t.address) ?? 0 : t.bal ?? 0;

    const owned: Token[] = [];
    const rest: Token[] = [];
    for (const t of matched) {
      if (balOf(t) > 0) owned.push(t);
      else rest.push(t);
    }
    owned.sort((a, b) => balOf(b) - balOf(a));
    return [...owned, ...rest];
  }, [universe, q, solBalances]);

  const queryIsUnverifiedMint =
    chainFilter !== "evm" &&
    filtered.length === 0 &&
    SOLANA_MINT_RE.test(q.trim());

  if (!open) return null;

  const visible = filtered.slice(0, RENDER_LIMIT);
  const truncated = filtered.length - visible.length;

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
            placeholder="Search name, symbol, or paste mint address"
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
          {visible.map((t, i) => (
            <div
              key={t.symbol + String(t.chainId) + t.address + i}
              className="token-row"
              onClick={() => onPick(t)}
            >
              <TokenIcon tok={t} size={34} />
              <div className="token-row-main">
                <div className="sym">
                  {t.symbol}
                  {t.verified === false && (
                    <span
                      style={{
                        marginLeft: 8,
                        padding: "1px 6px",
                        background: "rgba(255,165,0,0.14)",
                        border: "1px solid rgba(255,165,0,0.4)",
                        borderRadius: 4,
                        color: "#FFA500",
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Unverified
                    </span>
                  )}
                </div>
                <div className="name">
                  <span className={"chain-tag " + (t.chainId === "solana" ? "sol" : "evm")}>
                    {t.chainId === "solana" ? "SOL" : `EVM ${t.chainId}`}
                  </span>
                  {t.name}
                </div>
              </div>
              <div className="token-row-right">
                <div className="bal">{fmtAmt(balanceFor(t), t.symbol === "BONK" ? 0 : 4)}</div>
                <div className="usd">{fmtUSD(balanceFor(t) * (t.usd ?? 0))}</div>
              </div>
            </div>
          ))}

          {truncated > 0 && (
            <div
              style={{
                padding: "16px 0 8px",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--text3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {truncated.toLocaleString()} more · keep typing to narrow
            </div>
          )}

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
              {registryLoading
                ? "Loading registry…"
                : queryIsUnverifiedMint
                  ? "Unverified mint — not yet supported"
                  : "No tokens match"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
