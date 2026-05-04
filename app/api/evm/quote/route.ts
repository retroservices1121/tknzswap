import { NextRequest, NextResponse } from "next/server";
import { fetchEvmRoutes } from "@/lib/lifi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.fromChainId || !body.toChainId || !body.walletAddress) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const routes = await fetchEvmRoutes({
      fromChainId: body.fromChainId,
      toChainId: body.toChainId,
      fromToken: body.fromToken,
      toToken: body.toToken,
      fromAmount: body.fromAmount,
      walletAddress: body.walletAddress,
      sortBy: body.sortBy ?? "price",
    });

    return NextResponse.json({ routes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Quote failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
