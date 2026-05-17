/**
 * Server-side proxy for /v1/septic-score/lookup on Railway.
 *
 * Mirrors /api/broadband/lookup — same auth/CORS reasoning. The endpoint
 * returns the v2 rural_septic_score for an address (currently TX only).
 *
 * GET /api/broadband/septic-score?address=&city=&state=&zip=
 *   → upstream GET /v1/septic-score/lookup?<same>
 */

const UPSTREAM_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://permit-api-production-6eae.up.railway.app";

const API_KEY =
  process.env.BROADBAND_API_KEY ??
  process.env.NEXT_PUBLIC_DEMO_API_KEY ??
  "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const upstream = `${UPSTREAM_BASE}/v1/septic-score/lookup?${url.searchParams.toString()}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, {
      headers,
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "upstream_unreachable",
        message: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  const body = await upstreamRes.text();
  return new Response(body, {
    status: upstreamRes.status,
    headers: {
      "content-type":
        upstreamRes.headers.get("content-type") ??
        "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
