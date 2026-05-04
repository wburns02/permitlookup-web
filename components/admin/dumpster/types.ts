/**
 * Shared types for the admin dumpster analytics dashboard.
 *
 * Lives under `components/admin/dumpster/` so the components can import
 * without reaching into `app/admin/...` (Next 16's TypeScript path
 * resolution flags cross-`app/` type-only imports as missing modules).
 *
 * The shapes mirror what /home/will/scripts/dumpster_analytics_dump.sh
 * writes to /home/will/dashboard-cache/dumpster_analytics.json on R730.
 */

export type DumpsterAnalyticsKpis = {
  visitors_today: number;
  sessions_today: number;
  events_24h: number;
  last_event_at: string | null;
};

export type DumpsterAnalyticsSeriesRow = {
  date: string;
  sessions: number;
  visitors: number;
};

export type DumpsterAnalyticsGeoRow = {
  geo_city: string | null;
  geo_region: string | null;
  geo_country: string | null;
  sessions: number;
  last_seen: string | null;
};

export type DumpsterAnalyticsFunnel = {
  gate_unlock: number;
  page_view: number;
  filter_apply: number;
  lead_click: number;
  phone_tap: number;
};

export type DumpsterAnalyticsHotLead = {
  lead_id: string | null;
  grade: string | null;
  clicks: number;
  last_clicked: string | null;
};

export type DumpsterAnalyticsLiveFeedRow = {
  created_at: string;
  event_type: string;
  geo_city: string | null;
  geo_country: string | null;
  event_payload: Record<string, unknown> | null;
  path: string | null;
  viewport_width: number | null;
};

export type DumpsterAnalyticsPayload = {
  kpis: DumpsterAnalyticsKpis;
  series: DumpsterAnalyticsSeriesRow[];
  geo: DumpsterAnalyticsGeoRow[];
  funnel: DumpsterAnalyticsFunnel;
  hot_leads: DumpsterAnalyticsHotLead[];
  live_feed: DumpsterAnalyticsLiveFeedRow[];
  generated_at: string | null;
};
