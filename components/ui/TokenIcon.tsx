"use client";

import { useState } from "react";
import type { Token } from "@/types/token";

export function TokenIcon({ tok, size = 26 }: { tok: Token; size?: number }) {
  const [failed, setFailed] = useState(false);
  const showImg = !!tok.logoURI && !failed;

  return (
    <div
      className="token-icon-wrap"
      style={{
        width: size,
        height: size,
        background: showImg ? "var(--surface2)" : tok.bg,
        color: tok.fg,
      }}
    >
      {showImg ? (
        <img
          src={tok.logoURI}
          alt={tok.symbol}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.4) }}>{tok.symbol.slice(0, 1)}</span>
      )}
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
