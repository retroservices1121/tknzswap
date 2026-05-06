import { NextRequest, NextResponse } from "next/server";
import { getMayanQuote } from "@/lib/mayan";
import type { ChainId } from "@/lib/chains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CrossQuoteBody {
  fromChainId: ChainId;
  toChainId: ChainId;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: number;
  slippageBps?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CrossQuoteBody;

    if (
      body.fromChainId === undefined ||
      body.toChainId === undefined ||
      !body.fromTokenAddress ||
      !body.toTokenAddress ||
      !body.amount ||
      body.amount <= 0
    ) {
      return NextResponse.json({ error: "Missing or invalid params" }, { status: 400 });
    }

    const result = await getMayanQuote({
      fromChainId: body.fromChainId,
      toChainId: body.toChainId,
      fromTokenAddress: body.fromTokenAddress,
      toTokenAddress: body.toTokenAddress,
      amount: body.amount,
      slippageBps: body.slippageBps,
      referrerEvm: process.env.NEXT_PUBLIC_MAYAN_REFERRER_EVM,
      referrerSolana: process.env.NEXT_PUBLIC_MAYAN_REFERRER_SOLANA,
    });

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Cross quote failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
