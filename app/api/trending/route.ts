import { NextResponse } from "next/server";
import { getTrendingSolanaTokens } from "@/lib/trending";

export const runtime = "nodejs";
export const revalidate = 120;

export async function GET() {
  try {
    const tokens = await getTrendingSolanaTokens();
    return NextResponse.json(
      { tokens },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Trending fetch failed";
    return NextResponse.json({ error: msg, tokens: [] }, { status: 500 });
  }
}
