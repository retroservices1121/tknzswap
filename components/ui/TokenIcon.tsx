import type { Token } from "@/types/token";

export function TokenIcon({ tok, size = 26 }: { tok: Token; size?: number }) {
  return (
    <div
      className="token-icon"
      style={{
        width: size,
        height: size,
        background: tok.bg,
        color: tok.fg,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {tok.symbol.slice(0, 1)}
    </div>
  );
}

export function ChainDot({ chainId, size = 7 }: { chainId: number | "solana"; size?: number }) {
  const isSol = chainId === "solana";
  const bg = isSol ? "var(--accent)" : "var(--blue)";
  return (
    <span
      className="chain-dot"
      style={{ width: size, height: size, background: bg, borderRadius: "50%", display: "inline-block" }}
    />
  );
}
