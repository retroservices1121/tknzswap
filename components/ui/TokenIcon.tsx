import type { Token } from "@/types/token";

export function TokenIcon({ tok, size = 26 }: { tok: Token; size?: number }) {
  if (tok.logoURI) {
    return (
      <img
        src={tok.logoURI}
        alt={tok.symbol}
        width={size}
        height={size}
        className="token-icon-img"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
        onError={(e) => {
          // If the logo fails to load, swap to a colored-letter fallback.
          const el = e.currentTarget;
          el.style.display = "none";
          const sib = el.nextSibling as HTMLElement | null;
          if (sib) sib.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div
      className="token-icon"
      style={{
        width: size,
        height: size,
        background: tok.bg,
        color: tok.fg,
        fontSize: Math.round(size * 0.38),
        display: "flex",
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
