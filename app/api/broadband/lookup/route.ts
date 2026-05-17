/**
 * Server-side proxy for the live broadband-lookup endpoint on Railway.
 *
 * Why this exists: identical reasoning to /api/hail-leads — the Railway
 * permit-api's CORS allowlist does not include `https://broadband.ecbtx.com`,
 * and the live lookup endpoint also requires an X-API-Key. Routing the
 * browser call through this same-origin proxy sidesteps CORS and keeps the
 * key server-side.
 *
 * GET /api/broadband/lookup?address=&city=&state=&zip=
 *   → upstream GET /v1/broadband/lookup?<same>
 *
 * The upstream JSON body is returned verbatim. We intentionally do NOT
 * cache: usage is per-address, low-volume on the landing page, and the
 * upstream rate limit already absorbs the load.
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
  const upstream = `${UPSTREAM_BASE}/v1/broadband/lookup?${url.searchParams.toString()}`;

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
