// Formatting helpers, ported from design reference.

export function fmtAmt(n: number, dp: number = 6): string {
  if (n === 0) return "0";
  if (n < 0.0001 && n > 0) return n.toExponential(3);
  if (n >= 1_000_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { maximumFractionDigits: dp });
}

export function fmtUSD(n: number): string {
  if (n < 0.01 && n > 0) return "$" + n.toFixed(6);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
