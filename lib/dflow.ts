import "server-only";
import { DFLOW_FEE_BPS } from "./fee";

const DFLOW_BASE = "https://quote-api.dflow.net";

export interface DFlowQuoteParams {
  inputMint: string;   // SPL token mint
  outputMint: string;
  amount: string;      // raw token units (lamports for SOL)
  slippageBps: number; // e.g. 50 = 0.5%
}

export interface DFlowSwapParams {
  quoteResponse: object;
  userPublicKey: string;
}

export interface DFlowQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: { amount: string; feeBps: number } | null;
  priceImpactPct: string;
  routePlan: Array<{ swapInfo: { label?: string; ammKey?: string }; percent?: number }>;
  contextSlot?: number;
  timeTaken?: number;
}

function dflowHeaders(): HeadersInit {
  const key = process.env.DFLOW_API_KEY;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["x-api-key"] = key;
  return headers;
}

// Step 1 — quote.
export async function getDFlowQuote(params: DFlowQuoteParams): Promise<DFlowQuoteResponse> {
  const query = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: params.slippageBps.toString(),
    platformFeeBps: DFLOW_FEE_BPS.toString(),
    forJitoBundle: "true",
  });

  const res = await fetch(`${DFLOW_BASE}/quote?${query.toString()}`, {
    headers: dflowHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DFlow quote failed ${res.status}: ${err}`);
  }
  return (await res.json()) as DFlowQuoteResponse;
}

// Step 2 — swap tx (base64 VersionedTransaction; client signs).
export async function getDFlowSwapTx(params: DFlowSwapParams): Promise<string> {
  const res = await fetch(`${DFLOW_BASE}/swap`, {
    method: "POST",
    headers: { ...dflowHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      feeAccount: process.env.NEXT_PUBLIC_DFLOW_FEE_ACCOUNT,
      includeJitoSandwichMitigationAccount: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DFlow swap tx failed ${res.status}: ${err}`);
  }

  const data = (await res.json()) as { swapTransaction: string };
  return data.swapTransaction;
}
