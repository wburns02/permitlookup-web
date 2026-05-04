/**
 * Server-side proxy for the R730 dumpster-events admin rollup.
 *
 * The R730 cron at /home/will/scripts/dumpster_analytics_dump.sh runs every
 * 5 minutes, queries the `dumpster_events` table on Postgres, and writes a
 * single JSON snapshot to /home/will/dashboard-cache/dumpster_analytics.json.
 * Tailscale Funnel publishes that directory at
 * https://soc-api.tailad2d5f.ts.net/dashboard-cache/. This route fetches that
 * snapshot server-side so the browser never has to cross a Private Network
 * Access boundary.
 *
 *   GET /api/admin/dumpster-analytics → { kpis, series, geo, funnel,
 *                                         hot_leads, live_feed, generated_at }
 */

const UPSTREAM =
  (process.env.DASHBOARD_CACHE_UPSTREAM ??
    "https://soc-api.tailad2d5f.ts.net/dashboard-cache") +
  "/dumpster_analytics.json";

const EMPTY_PAYLOAD = {
  kpis: {
    visitors_today: 0,
    sessions_today: 0,
    events_24h: 0,
    last_event_at: null,
  },
  series: [],
  geo: [],
  funnel: {
    gate_unlock: 0,
    page_view: 0,
    filter_apply: 0,
    lead_click: 0,
    phone_tap: 0,
  },
  hot_leads: [],
  live_feed: [],
  generated_at: null as string | null,
};

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      headers: { Accept: "application/json" },
      // We want the freshest snapshot — let Vercel's edge cache handle dedup.
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });

    if (!res.ok) {
      // Upstream missing the file is a "no events yet" scenario — render the
      // page with empty arrays rather than surfacing a 502 to the browser.
      if (res.status === 404) {
        return new Response(JSON.stringify(EMPTY_PAYLOAD), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, s-maxage=30",
          },
        });
      }
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
        // The cron writes every 5 min, so a 60s edge cache is fine.
        "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
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
