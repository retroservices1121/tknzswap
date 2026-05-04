"use client";

import { useSwapStore } from "@/store/swap";
import { ALL_CHAINS } from "@/lib/chains";
import { SOLANA_TOKENS, EVM_TOKENS } from "@/lib/tokens";
import type { Token } from "@/types/token";
import type { ChainId } from "@/lib/chains";
import { SwapCard } from "@/components/swap/SwapCard";

function poolFor(chainId: ChainId): Token[] {
  return chainId === "solana" ? SOLANA_TOKENS : EVM_TOKENS.filter((t) => t.chainId === chainId);
}

function defaultsFor(chainId: ChainId): { from: Token | null; to: Token | null } {
  const pool = poolFor(chainId);
  if (pool.length === 0) return { from: null, to: null };
  const from = pool[0];
  const to =
    pool.find((t) => t.symbol === "USDC" && t.address !== from.address) ??
    pool.find((t) => t.address !== from.address) ??
    null;
  return { from, to };
}

export function Hero() {
  const { from, setFrom, setTo } = useSwapStore();
  const activeChain: ChainId = from?.chainId ?? "solana";

  const switchChain = (chainId: ChainId) => {
    const { from: f, to: t } = defaultsFor(chainId);
    if (f) setFrom(f);
    if (t) setTo(t);
  };

  return (
    <section className="hero">
      <div>
        <span className="kicker">
          <span className="chip-tag">V1.4</span>
          Covered user interface · Rule 15b9-1
        </span>
        <h1 className="headline">
          Route any asset
          <br />
          across <span className="brand-solana">Solana</span>
          <span className="slash">/</span>
          <span className="accent-b">EVM</span>
          <br />
          at the best price.
        </h1>
        <p className="lede">
          tknz aggregates execution across two infrastructures.{" "}
          <span className="brand-solana">Solana</span> orders flow through{" "}
          <span className="brand-dflow">DFlow</span> for on-chain price improvement. EVM orders
          flow through <span className="brand-lifi">Li.Fi</span> for multi-bridge route
          optimization. One interface. Full disclosure. No custody.
        </p>

        <div className="infra-split">
          <div className="infra-col blue">
            <div className="infra-col-label">
              <span className="pulse-dot blue" />
              <span style={{ color: "var(--text)" }}>EVM LAYER</span>
            </div>
            <div className="infra-col-value brand-lifi">Li.Fi</div>
            <div className="infra-col-sub">17 chains · 42 bridges · 28 DEX aggregators</div>
          </div>
          <div className="infra-col green">
            <div className="infra-col-label">
              <span className="pulse-dot" />
              <span style={{ color: "var(--text)" }}>
                <span className="brand-solana">SOLANA</span> LAYER
              </span>
            </div>
            <div className="infra-col-value brand-dflow">DFlow</div>
            <div className="infra-col-sub">Order flow auction · 11 market makers</div>
          </div>
        </div>

        <div className="chain-pills">
          {ALL_CHAINS.map((c) => {
            const isActive = activeChain === c.id;
            const color = c.id === "solana" ? "green" : "blue";
            return (
              <button
                key={String(c.id)}
                className={"chain-pill " + (isActive ? `active ${color}` : "")}
                onClick={() => switchChain(c.id)}
                type="button"
              >
                <span className="glyph">{c.name[0]}</span>
                {c.name}
              </button>
            );
          })}
        </div>

        <div className="stats-row">
          {[
            { n: "$4.82", u: "B", l: "Volume routed (30d)" },
            { n: "312", u: "", l: "Liquidity venues" },
            { n: "14", u: "BPS", l: "Median price improvement" },
            { n: "48", u: "MS", l: "Quote latency (P50)" },
          ].map((s, i) => (
            <div key={i}>
              <div className="stat-num">
                {s.n}
                <span className="unit">{s.u}</span>
              </div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="swap-wrap">
        <SwapCard />
      </div>
    </section>
  );
}
