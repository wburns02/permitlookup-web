/**
 * Server-side proxy for the live hail-leads API on Railway.
 *
 * Why this exists: the Railway permit-api's CORS allowlist does not
 * include `https://hail.ecbtx.com` (or `https://dumpster.ecbtx.com`) for
 * the per-lead detail endpoint, so the browser preflight fails and the
 * drawer can't load. Railway auto-deploy is also currently broken for
 * `permit-api`, so we cannot ship a CORS fix server-side easily. This
 * proxy keeps the API call same-origin, sidestepping CORS entirely, and
 * adds the `X-API-Key` header from a server-side env so we don't need to
 * expose the key to the browser through this path.
 *
 * Routes (catch-all, optional):
 *   GET /api/hail-leads/                          → upstream /v1/hail-leads/
 *   GET /api/hail-leads/?<query>                  → upstream /v1/hail-leads/?<query>
 *   GET /api/hail-leads/<uuid>                    → upstream /v1/hail-leads/<uuid>
 *   GET /api/hail-leads/stats                     → upstream /v1/hail-leads/stats
 *   GET /api/hail-leads/export.csv?<query>        → upstream /v1/hail-leads/export.csv?<query>
 *
 * The upstream JSON body is returned verbatim with a short edge cache.
 */

const UPSTREAM_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://permit-api-production-6eae.up.railway.app";

// Same key the client used to send. Keeping it on `NEXT_PUBLIC_DEMO_API_KEY`
// means we don't need to provision a new Vercel env to fix the drawer.
const API_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

export async function GET(
  req: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await context.params;
  const segments = path ?? [];
  const url = new URL(req.url);

  // Preserve the trailing slash on the bare-list call: upstream FastAPI
  // routes typically distinguish `/v1/hail-leads/` from `/v1/hail-leads`,
  // and the existing client code calls the slashed form for the list.
  const subPath = segments.length === 0 ? "" : segments.map(encodeURIComponent).join("/");
  const upstream = `${UPSTREAM_BASE}/v1/hail-leads/${subPath}${url.search}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  // CSV export needs to flow through with the right content-type.
  const isCsv = segments[segments.length - 1] === "export.csv";
  if (isCsv) headers.Accept = "text/csv, application/json;q=0.5";

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream, {
      headers,
      signal: AbortSignal.timeout(10_000),
      // Default-fresh; the edge cache header below dedupes downstream.
      cache: "no-store",
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "upstream_unreachable",
        message: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }

  if (!upstreamRes.ok) {
    const body = await upstreamRes.text().catch(() => null);
    return new Response(
      JSON.stringify({
        error: "upstream_failed",
        status: upstreamRes.status,
        body,
      }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const responseBody = await upstreamRes.text();
  const contentType =
    upstreamRes.headers.get("content-type") ??
    (isCsv ? "text/csv; charset=utf-8" : "application/json; charset=utf-8");

  // Per-lead detail rarely changes; the list refreshes nightly. A 60s
  // edge cache is safe and cuts Railway load.
  const responseHeaders: Record<string, string> = {
    "content-type": contentType,
    "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
  };

  // Preserve Content-Disposition for CSV downloads so the browser names
  // the file correctly.
  const cd = upstreamRes.headers.get("content-disposition");
  if (cd) responseHeaders["content-disposition"] = cd;

  return new Response(responseBody, {
    status: 200,
    headers: responseHeaders,
  });
}
