// Two formats — one per execution layer. Never mix them.
export const LIFI_FEE_FLOAT = 0.0015;   // Li.Fi: float, e.g. fee: 0.0015
export const DFLOW_FEE_BPS = 15;        // DFlow: integer bps, e.g. platformFeeBps: 15
export const FEE_DISPLAY_PCT = "0.15%"; // Human display only

export function calculateFeeUSD(swapAmountUSD: number): number {
  return swapAmountUSD * LIFI_FEE_FLOAT;
}

// Price improvement on both layers is structural — embedded in toAmount.
// There is NO rebate cashflow. Do not model, display, or imply one exists.
