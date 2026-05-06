"use client";

import Link from "next/link";
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

  // Preset USDC on Base → SOL on Solana to demo the cross-VM flow in one click.
  const previewCrossVM = () => {
    const baseUSDC = EVM_TOKENS.find((t) => t.symbol === "USDC" && t.chainId === 8453);
    const sol = SOLANA_TOKENS.find((t) => t.symbol === "SOL");
    if (baseUSDC) setFrom(baseUSDC);
    if (sol) setTo(sol);
  };

  return (
    <section className="hero">
      <div>
        <span className="kicker">
          <span className="chip-tag">V1.5</span>
          Covered user interface · Rule 15b9-1
        </span>
        <h1 className="headline">
          Bridge in. Trade out.
          <br />
          <span className="brand-solana">One</span> signature.
        </h1>
        <p className="lede">
          tknz is the only non-custodial swap UI that aggregates{" "}
          <span className="brand-dflow">DFlow</span> on Solana,{" "}
          <span className="brand-lifi">Li.Fi</span> across EVM, and{" "}
          <span style={{ color: "#B073FF", fontWeight: 600 }}>Mayan Swift</span> for atomic
          cross-VM swaps. Bring USDC from Base, leave with SOL — in one transaction. No
          custody. Full disclosure. Built Solana-first.
        </p>

        <div className="whats-new">
          <button
            type="button"
            className="whats-new-chip purple"
            onClick={previewCrossVM}
          >
            <span className="pulse-dot purple" />
            <b>NEW · Cross-VM live</b> &middot; USDC (Base) → SOL in one sig
          </button>
          <Link href="/trending" className="whats-new-chip green">
            <span className="pulse-dot" />
            <b>Trending on Solana</b> &middot; Top movers, click to trade
          </Link>
          <Link href="/docs/embed" className="whats-new-chip blue">
            <span className="pulse-dot blue" />
            <b>Embed the widget</b> &middot; Drop tknz into any product
          </Link>
        </div>

        <div className="infra-split">
          <div className="infra-col green">
            <div className="infra-col-label">
              <span className="pulse-dot" />
              <span style={{ color: "var(--text)" }}>
                <span className="brand-solana">SOLANA</span> · PRIMARY
              </span>
            </div>
            <div className="infra-col-value brand-dflow">DFlow</div>
            <div className="infra-col-sub">11 makers · Jito-bundle protected</div>
          </div>
          <div className="infra-col purple">
            <div className="infra-col-label">
              <span className="pulse-dot purple" />
              <span style={{ color: "var(--text)" }}>CROSS-VM</span>
            </div>
            <div className="infra-col-value">Mayan Swift</div>
            <div className="infra-col-sub">Atomic EVM ↔ Solana · ~30s settle</div>
          </div>
          <div className="infra-col blue">
            <div className="infra-col-label">
              <span className="pulse-dot blue" />
              <span style={{ color: "var(--text)" }}>EVM</span>
            </div>
            <div className="infra-col-value brand-lifi">Li.Fi</div>
            <div className="infra-col-sub">17 chains · 42 bridges · 28 aggregators</div>
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
