import { NextRequest, NextResponse } from "next/server";
import { getDFlowQuote } from "@/lib/dflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps");

    if (!inputMint || !outputMint || !amount || !slippageBps) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const quote = await getDFlowQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps: parseInt(slippageBps, 10),
    });

    return NextResponse.json(quote);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Quote failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
