"use client";

import { useRouter } from "next/navigation";
import { useTrending, type TrendingToken } from "@/hooks/useTrending";
import { useSwapStore } from "@/store/swap";
import { SOLANA_TOKENS } from "@/lib/tokens";
import { fmtUSD } from "@/lib/format";
import type { Token } from "@/types/token";

const USDC_SOL = SOLANA_TOKENS.find((t) => t.symbol === "USDC")!;

function colorForSymbol(sym: string): string {
  let h = 0;
  for (let i = 0; i < sym.length; i++) h = (h * 31 + sym.charCodeAt(i)) >>> 0;
  const palette = ["#9945FF", "#03E1FF", "#B4FF6A", "#F7C2FF", "#FFA500", "#7DFFB3", "#4F7CFF", "#C8F284"];
  return palette[h % palette.length];
}

function trendingToToken(t: TrendingToken): Token {
  return {
    symbol: t.symbol,
    name: t.name || t.symbol,
    decimals: 9, // safe default for SPL; real decimals resolved by DFlow at quote time
    chainId: "solana",
    address: t.mint,
    bg: colorForSymbol(t.symbol),
    fg: "#080A0F",
    logoURI: t.logoURI ?? undefined,
    verified: false,
    usd: t.priceUSD,
  };
}

function fmtCompact(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function fmtAge(min: number | null): string {
  if (min === null) return "—";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function TrendingPage() {
  const router = useRouter();
  const { setFrom, setTo, setAmount } = useSwapStore();
  const { data: tokens, isLoading, error, refetch, isFetching } = useTrending();

  const onTrade = (t: TrendingToken) => {
    setFrom(USDC_SOL);
    setTo(trendingToToken(t));
    setAmount("");
    router.push("/");
  };

  return (
    <main className="page" style={{ paddingTop: 40, paddingBottom: 80, minHeight: "60vh" }}>
      <div className="trending-head">
        <div>
          <div className="section-kicker">Live · Solana mainnet</div>
          <h1 className="trending-title">Trending on Solana</h1>
          <p className="trending-sub">
            Top movers by volume from on-chain pools. Click any token to load it into the
            swap card with USDC as your source.
          </p>
        </div>
        <button
          type="button"
          className="connect-btn"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{ alignSelf: "flex-start" }}
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="trending-error">Failed to load trending data. Try refresh.</div>
      )}

      {isLoading && !tokens && (
        <div className="trending-loading">
          <span className="pulse-dot" style={{ background: "var(--accent)" }} />
          Loading trending pools…
        </div>
      )}

      {tokens && tokens.length > 0 && (
        <div className="trending-grid">
          {tokens.map((t, i) => {
            const isUp = t.priceChange24h >= 0;
            return (
              <div key={t.mint} className="trending-card">
                <div className="trending-rank">#{i + 1}</div>
                <div className="trending-token">
                  {t.logoURI ? (
                    <img
                      src={t.logoURI}
                      alt={t.symbol}
                      width={40}
                      height={40}
                      className="trending-logo"
                    />
                  ) : (
                    <div
                      className="trending-logo-fallback"
                      style={{ background: colorForSymbol(t.symbol) }}
                    >
                      {t.symbol.slice(0, 1)}
                    </div>
                  )}
                  <div className="trending-token-meta">
                    <div className="trending-symbol">{t.symbol}</div>
                    <div className="trending-name">{t.name}</div>
                  </div>
                </div>

                <div className="trending-stats">
                  <div className="trending-stat">
                    <div className="trending-stat-k">Price</div>
                    <div className="trending-stat-v">
                      {t.priceUSD < 0.01 ? `$${t.priceUSD.toPrecision(3)}` : fmtUSD(t.priceUSD)}
                    </div>
                  </div>
                  <div className="trending-stat">
                    <div className="trending-stat-k">24h</div>
                    <div className={"trending-stat-v " + (isUp ? "up" : "down")}>
                      {fmtPct(t.priceChange24h)}
                    </div>
                  </div>
                  <div className="trending-stat">
                    <div className="trending-stat-k">1h</div>
                    <div className={"trending-stat-v " + (t.priceChange1h >= 0 ? "up" : "down")}>
                      {fmtPct(t.priceChange1h)}
                    </div>
                  </div>
                  <div className="trending-stat">
                    <div className="trending-stat-k">Vol 24h</div>
                    <div className="trending-stat-v">{fmtCompact(t.volume24hUSD)}</div>
                  </div>
                  <div className="trending-stat">
                    <div className="trending-stat-k">FDV</div>
                    <div className="trending-stat-v">
                      {t.fdvUSD ? fmtCompact(t.fdvUSD) : "—"}
                    </div>
                  </div>
                  <div className="trending-stat">
                    <div className="trending-stat-k">Pool age</div>
                    <div className="trending-stat-v">{fmtAge(t.poolAgeMinutes)}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="swap-btn green"
                  style={{ height: 40, fontSize: 12 }}
                  onClick={() => onTrade(t)}
                >
                  Trade {t.symbol} →
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="trending-footer">
        Data via Geckoterminal · Updates every 2 minutes · Trading enabled via DFlow on
        Solana with Jito-bundle protection. Cross-VM users: swap in from any EVM chain via
        Mayan Swift directly from the trade card.
      </div>
    </main>
  );
}
