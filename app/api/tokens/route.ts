import { NextResponse } from "next/server";
import { ALL_TOKENS, EVM_TOKENS, SOLANA_TOKENS } from "@/lib/tokens";

export const runtime = "nodejs";

// GET /api/tokens?chain=solana | ?chain=evm | (none) → all
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chain = searchParams.get("chain");

  if (chain === "solana") return NextResponse.json({ tokens: SOLANA_TOKENS });
  if (chain === "evm") return NextResponse.json({ tokens: EVM_TOKENS });
  return NextResponse.json({ tokens: ALL_TOKENS });
}
