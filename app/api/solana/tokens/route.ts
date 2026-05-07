import { NextResponse } from "next/server";
import { getSolanaTokenRegistry } from "@/lib/solanaRegistry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tokens = await getSolanaTokenRegistry();
    return NextResponse.json(
      { tokens, count: tokens.length },
      {
        headers: {
          // Modest CDN caching only — short max-age means a stuck empty
          // response won't survive long if anything goes wrong upstream.
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registry fetch failed";
    return NextResponse.json(
      { error: msg, tokens: [], count: 0 },
      { status: 502 }
    );
  }
}
