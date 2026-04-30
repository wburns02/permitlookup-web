<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://permit-api-production-6eae.up.railway.app` | Live hail-leads API (Railway). Only hit after the user applies a filter — the default dashboard render reads from the static cache below. |
| `NEXT_PUBLIC_DEMO_API_KEY` | `pl_demo_…` | `X-API-Key` header for the live API. |
| `NEXT_PUBLIC_DEMO_PASSWORD` | `#Espn2025` | Client-side gate password (`HailLeadsGate`). |
| `NEXT_PUBLIC_DASHBOARD_CACHE_BASE` | `https://soc-api.tailad2d5f.ts.net/dashboard-cache` | Static JSON snapshot served by R730 over Tailscale Funnel. Refreshed hourly by cron; serves CORS `*` and `Cache-Control: public, max-age=300`. Endpoints: `/stats.json`, `/default_leads.json`. |

## Dashboard data flow (Stage 2)

The hail-leads dashboard does **not** call the live API on first paint. It reads `stats.json` and `default_leads.json` from the R730 cache (`NEXT_PUBLIC_DASHBOARD_CACHE_BASE`) and only falls back to `NEXT_PUBLIC_API_BASE` once the user applies a filter. If the live API fails, we revert the table to the cached snapshot and surface an amber "Live data unavailable" banner. If the cache itself is unreachable, hardcoded `FALLBACK_*` constants in `lib/cache.ts` keep the UI rendering. See:

- `lib/cache.ts` — typed cache fetcher + fallback constants.
- `lib/api.ts` — `getHailLeadsListWithCache`, `getHailLeadsStatsCached`, `hasUserFilters`.
- `components/cache-banner.tsx` — info / warning banner.
- `app/hail-leads/dashboard-client.tsx` — wiring.
