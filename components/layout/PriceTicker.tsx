import { fmtUSD, fmtPct } from "@/lib/format";

interface TickerRow {
  sym: string;
  chain: "sol" | "evm";
  price: number;
  chg: number;
}

const TICKER_ROWS: TickerRow[] = [
  { sym: "SOL",   chain: "sol", price: 187.42,    chg: 2.14 },
  { sym: "ETH",   chain: "evm", price: 3481.20,   chg: -0.42 },
  { sym: "WBTC",  chain: "evm", price: 68240.00,  chg: 1.84 },
  { sym: "JUP",   chain: "sol", price: 0.78,      chg: 4.21 },
  { sym: "ARB",   chain: "evm", price: 0.91,      chg: -1.12 },
  { sym: "JTO",   chain: "sol", price: 2.84,      chg: 6.08 },
  { sym: "OP",    chain: "evm", price: 2.14,      chg: -0.88 },
  { sym: "USDC",  chain: "sol", price: 1.0002,    chg: 0.00 },
  { sym: "BONK",  chain: "sol", price: 0.0000214, chg: 11.40 },
  { sym: "MATIC", chain: "evm", price: 0.64,      chg: -2.41 },
];

export function PriceTicker() {
  const items = [...TICKER_ROWS, ...TICKER_ROWS];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.map((t, i) => (
          <div key={i} className="ticker-item">
            <span className="sym">{t.sym}</span>
            <span className={"chain-tag " + (t.chain === "sol" ? "sol" : "evm")}>{t.chain}</span>
            <span className="price">
              {t.price < 0.01 ? "$" + t.price.toFixed(8) : fmtUSD(t.price)}
            </span>
            <span className={"chg " + (t.chg >= 0 ? "up" : "down")}>{fmtPct(t.chg)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
