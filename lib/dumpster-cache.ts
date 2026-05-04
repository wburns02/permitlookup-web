/**
 * Static dashboard cache fetcher for dumpster leads.
 *
 * Mirrors `lib/cache.ts` but points at `dumpster_*.json`. Same proxy pattern:
 * the browser hits `/api/dashboard-cache/dumpster_<file>` (a same-origin Next
 * route handler) which fetches `<UPSTREAM>/dumpster_<file>.json` server-side.
 * On the server (SSR / Vercel function) we go direct to the upstream.
 *
 * The upstream is the R730 hourly snapshot over Tailscale Funnel. Chrome's
 * Private Network Access policy blocks the browser from reaching `*.ts.net`
 * directly, hence the proxy.
 *
 * Returns hardcoded fallbacks when the cache itself is unreachable so the
 * dashboard never renders blank.
 */

import type {
  DumpsterLead,
  DumpsterLeadsResponse,
  DumpsterStats,
} from "./dumpster-types";

const UPSTREAM_BASE =
  process.env.DASHBOARD_CACHE_UPSTREAM ??
  process.env.NEXT_PUBLIC_DASHBOARD_CACHE_UPSTREAM ??
  "https://soc-api.tailad2d5f.ts.net/dashboard-cache";

const CLIENT_BASE =
  process.env.NEXT_PUBLIC_DASHBOARD_CACHE_BASE ?? "/api/dashboard-cache";

const IS_SERVER = typeof window === "undefined";

type DumpsterFile = "dumpster_stats" | "dumpster_default_leads";

function fileUrl(name: DumpsterFile): string {
  if (IS_SERVER) return `${UPSTREAM_BASE}/${name}.json`;
  const base = CLIENT_BASE;
  return /^https?:\/\//i.test(base)
    ? `${base}/${name}.json`
    : `${base}/${name}`;
}

export type CachedDumpsterStats = DumpsterStats & { generated_at?: string };
export type CachedDumpsterLeadsResponse = DumpsterLeadsResponse & {
  generated_at?: string;
};

// ---------------------------------------------------------------------------
// Hardcoded fallback — only used when the cache is unreachable on first paint.
// Numbers chosen to be reasonable for marketing demos (matches what the
// upstream is publishing today: 248 / 52 in Baton Rouge).
// ---------------------------------------------------------------------------

export const FALLBACK_DUMPSTER_STATS: CachedDumpsterStats = {
  metro: "Baton Rouge, LA",
  total_leads_30d: 0,
  total_leads_90d: 0,
  high_value_count_30d: 0,
  top_permit_type_30d: null,
  top_permit_type_count_30d: 0,
  average_valuation_30d: 0,
  median_valuation_30d: 0,
  fresh_leads_this_week: 0,
  latest_permit_date: null,
};

export const FALLBACK_DUMPSTER_LEADS: CachedDumpsterLeadsResponse = {
  results: [],
};

// ---------------------------------------------------------------------------
// Coercion helpers
// ---------------------------------------------------------------------------

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function coerceLead(raw: Record<string, unknown>): DumpsterLead {
  return {
    lead_id: String(raw.lead_id ?? ""),
    address: (raw.address as string | null) ?? null,
    city: (raw.city as string | null) ?? null,
    zip: (raw.zip as string | null) ?? null,
    county: (raw.county as string | null) ?? null,
    permit_type: (raw.permit_type as string | null) ?? null,
    work_class: (raw.work_class as string | null) ?? null,
    description: (raw.description as string | null) ?? null,
    issue_date: (raw.issue_date as string | null) ?? null,
    applied_date: (raw.applied_date as string | null) ?? null,
    effective_date:
      (raw.effective_date as string | null) ??
      (raw.issue_date as string | null) ??
      (raw.applied_date as string | null) ??
      null,
    days_since_issue: toNumberOrNull(raw.days_since_issue),
    valuation: toNumberOrNull(raw.valuation),
    contractor_company: (raw.contractor_company as string | null) ?? null,
    contractor_phone: (raw.contractor_phone as string | null) ?? null,
    contractor_email: (raw.contractor_email as string | null) ?? null,
    contractor_license_number:
      (raw.contractor_license_number as string | null) ?? null,
    contractor_license_status:
      (raw.contractor_license_status as string | null) ?? null,
    contractor_license_expires:
      (raw.contractor_license_expires as string | null) ?? null,
    owner_name: (raw.owner_name as string | null) ?? null,
    category: ((raw.category as string | null) ?? "other") || "other",
    source: ((raw.source as string | null) ?? "") || "",
  };
}

// ---------------------------------------------------------------------------
// Public fetchers
// ---------------------------------------------------------------------------

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "default",
    signal: signal ?? AbortSignal.timeout(5_000),
  });
  if (!res.ok) {
    throw new Error(`Cache ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function getCachedDumpsterStats(
  signal?: AbortSignal,
): Promise<CachedDumpsterStats> {
  try {
    const raw = await fetchJson<Record<string, unknown>>(
      fileUrl("dumpster_stats"),
      signal,
    );
    return {
      metro:
        (raw.metro as string | undefined) ?? FALLBACK_DUMPSTER_STATS.metro,
      total_leads_30d:
        toNumberOrNull(raw.total_leads_30d) ??
        FALLBACK_DUMPSTER_STATS.total_leads_30d,
      total_leads_90d:
        toNumberOrNull(raw.total_leads_90d) ??
        FALLBACK_DUMPSTER_STATS.total_leads_90d,
      high_value_count_30d:
        toNumberOrNull(raw.high_value_count_30d) ??
        FALLBACK_DUMPSTER_STATS.high_value_count_30d,
      top_permit_type_30d:
        (raw.top_permit_type_30d as string | null) ?? null,
      top_permit_type_count_30d:
        toNumberOrNull(raw.top_permit_type_count_30d) ?? 0,
      average_valuation_30d: toNumberOrNull(raw.average_valuation_30d) ?? 0,
      median_valuation_30d: toNumberOrNull(raw.median_valuation_30d) ?? 0,
      fresh_leads_this_week:
        toNumberOrNull(raw.fresh_leads_this_week) ??
        FALLBACK_DUMPSTER_STATS.fresh_leads_this_week,
      latest_permit_date:
        (raw.latest_permit_date as string | null) ?? null,
      generated_at: (raw.generated_at as string | undefined) ?? undefined,
    };
  } catch {
    return FALLBACK_DUMPSTER_STATS;
  }
}

export async function getCachedDumpsterLeads(
  signal?: AbortSignal,
): Promise<CachedDumpsterLeadsResponse> {
  try {
    const raw = await fetchJson<Record<string, unknown>>(
      fileUrl("dumpster_default_leads"),
      signal,
    );
    const rawResults = Array.isArray(raw.results)
      ? (raw.results as Record<string, unknown>[])
      : [];
    return {
      metro: (raw.metro as string | undefined) ?? undefined,
      results: rawResults.map(coerceLead),
      generated_at: (raw.generated_at as string | undefined) ?? undefined,
    };
  } catch {
    return FALLBACK_DUMPSTER_LEADS;
  }
}
