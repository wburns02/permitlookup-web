/**
 * Server-side proxy for /v1/roofer-leads/recent on Railway.
 *
 * Identical pattern to /api/broadband/lookup — same upstream, same X-API-Key
 * header injection, same no-cache policy. Sidesteps the upstream CORS
 * allowlist (which doesn't include hail.ecbtx.com / storms.ecbtx.com /
 * roofers.ecbtx.com) and keeps the demo key server-side.
 *
 * GET /api/roofers/recent?state=&days_back=&min_score=&min_magnitude=&radius_miles=&limit=
 *   → upstream GET /v1/roofer-leads/recent?<same>
 *
 * Body is forwarded verbatim. The upstream query can be slow (single-event
 * spatial scans against NOAA + 35M mortgage joins), so we use a 60s client
 * timeout and surface a structured error on timeout/network failure.
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
  const upstream = `${UPSTREAM_BASE}/v1/roofer-leads/recent?${url.searchParams.toString()}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, {
      headers,
      signal: AbortSignal.timeout(60_000),
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
