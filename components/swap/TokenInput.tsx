"use client";

import { useMemo } from "react";
import type { Token } from "@/types/token";
import { TokenIcon, ChainDot } from "@/components/ui/TokenIcon";
import { IconCaret } from "@/components/ui/Icons";
import { fmtAmt, fmtUSD } from "@/lib/format";
import { useTokenBalance } from "@/hooks/useTokenBalances";

interface Props {
  label: string;
  tok: Token | null;
  amount: string;
  onAmount: (v: string) => void;
  onPick: () => void;
  readOnly?: boolean;
}

export function TokenInput({ label, tok, amount, onAmount, onPick, readOnly }: Props) {
  const { balance, connected } = useTokenBalance(tok);

  const usd = useMemo(() => {
    const n = parseFloat(amount);
    if (isNaN(n)) return 0;
    return n * (tok?.usd ?? 0);
  }, [amount, tok]);

  return (
    <div className="token-box">
      <div className="tb-head">
        <span>{label}</span>
        {tok && (
          <span className="tb-balance">
            <span>BAL {connected ? fmtAmt(balance, tok.symbol === "BONK" ? 0 : 4) : "—"}</span>
            {!readOnly && connected && balance > 0 && (
              <>
                <button onClick={() => onAmount(String(balance / 2))}>50%</button>
                <button onClick={() => onAmount(String(balance))}>MAX</button>
              </>
            )}
          </span>
        )}
      </div>
      <div className="tb-body">
        <button className="token-chip" onClick={onPick} type="button">
          {tok ? (
            <>
              <TokenIcon tok={tok} size={22} />
              <span>{tok.symbol}</span>
              <ChainDot chainId={tok.chainId} />
              <span className="caret">
                <IconCaret />
              </span>
            </>
          ) : (
            <>
              <span style={{ paddingLeft: 4 }}>SELECT</span>
              <span className="caret">
                <IconCaret />
              </span>
            </>
          )}
        </button>
        <input
          className="amount-input"
          value={amount}
          onChange={(e) => onAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.00"
          readOnly={readOnly}
          inputMode="decimal"
        />
      </div>
      <div className="tb-foot">
        <span>{tok ? tok.name : " "}</span>
        <span>{fmtUSD(usd)}</span>
      </div>
    </div>
  );
}
