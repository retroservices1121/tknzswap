import { NextRequest, NextResponse } from "next/server";
import { getDFlowSwapTx } from "@/lib/dflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { quoteResponse, userPublicKey } = await req.json();

    if (!quoteResponse || !userPublicKey) {
      return NextResponse.json(
        { error: "Missing quoteResponse or userPublicKey" },
        { status: 400 }
      );
    }

    const swapTransaction = await getDFlowSwapTx({ quoteResponse, userPublicKey });
    return NextResponse.json({ swapTransaction });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Swap tx failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
