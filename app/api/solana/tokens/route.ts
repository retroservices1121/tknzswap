import { NextResponse } from "next/server";
import { getSolanaTokenRegistry } from "@/lib/solanaRegistry";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const tokens = await getSolanaTokenRegistry();
    return NextResponse.json(
      { tokens },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registry fetch failed";
    return NextResponse.json({ error: msg, tokens: [] }, { status: 500 });
  }
}
