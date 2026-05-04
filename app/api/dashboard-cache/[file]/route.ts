/**
 * Server-side proxy for the R730 static dashboard cache.
 *
 * Why this exists: the cache is published over Tailscale Funnel
 * (`*.ts.net`). Modern Chrome's Private Network Access (PNA) policy
 * blocks public-internet origins (e.g. `https://hail.ecbtx.com`) from
 * fetching `*.ts.net` URLs because they resolve to Tailscale's
 * loopback/CGNAT space, regardless of CORS headers. Proxying through
 * this Vercel Function keeps the upstream call entirely server-side,
 * avoiding the PNA boundary on the client.
 *
 * Routes:
 *   GET /api/dashboard-cache/stats         → upstream /stats.json
 *   GET /api/dashboard-cache/default_leads → upstream /default_leads.json
 *
 * The proxy preserves the upstream JSON body verbatim and adds a short
 * `Cache-Control: public, s-maxage=300` so Vercel's edge cache can dedupe
 * downstream traffic without losing freshness against the hourly cron.
 */

const UPSTREAM_BASE =
  process.env.DASHBOARD_CACHE_UPSTREAM ??
  "https://soc-api.tailad2d5f.ts.net/dashboard-cache";

const ALLOWED_FILES = new Set([
  "stats",
  "default_leads",
  "dumpster_stats",
  "dumpster_default_leads",
]);

export async function GET(
  _req: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (!ALLOWED_FILES.has(file)) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const upstream = `${UPSTREAM_BASE}/${file}.json`;
  try {
    const res = await fetch(upstream, {
      headers: { Accept: "application/json" },
      // Server-to-server: 5s is plenty.
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "upstream_failed", status: res.status }),
        {
          status: 502,
          headers: { "content-type": "application/json" },
        },
      );
    }
    const body = await res.text();
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
      },
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
}
