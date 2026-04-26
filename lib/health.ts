/**
 * Typed fetch client for the PermitLookup hail-leads health endpoint.
 *
 * Mirrors lib/api.ts: uses NEXT_PUBLIC_API_BASE + NEXT_PUBLIC_DEMO_API_KEY,
 * throws ApiError on non-2xx, defaults to no-store to keep readings fresh.
 *
 * Source of truth for the schema: permit-api/app/schemas/hail_leads.py
 * (HailLeadsHealth and friends).
 */

import { ApiError } from "./api";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://permit-api-production-6eae.up.railway.app";
const API_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CronStatus = "ok" | "stale" | "missing";

export type MaterializedViewFreshness = {
  name: string;
  row_count: number;
  last_data_at: string | null;
  hours_since_data: number | null;
  last_analyzed_at: string | null;
  hours_since_analyze: number | null;
};

export type StormSourceFreshness = {
  source: string;
  latest_report_date: string | null;
  days_since: number | null;
  rows_last_7d: number;
  rows_last_30d: number;
};

export type FreshLeadsCounts = {
  this_week: number;
  last_week: number;
  last_30d: number;
};

export type CoverageStat = {
  name: string;
  enriched_rows: number;
  total_addresses: number;
  percent_covered: number;
};

export type CronHeartbeat = {
  name: string;
  last_seen_at: string | null;
  hours_since: number | null;
  status: CronStatus;
};

export type HailLeadsHealth = {
  generated_at: string;
  materialized_views: MaterializedViewFreshness[];
  storm_sources: StormSourceFreshness[];
  fresh_leads: FreshLeadsCounts;
  coverage: CoverageStat[];
  crons: CronHeartbeat[];
};

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

type FetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function request<T>(path: string, init: FetchInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers ?? {}),
  };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
    signal: init.signal ?? AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    let bodyText: string | null = null;
    try {
      bodyText = await res.text();
    } catch {
      /* ignore */
    }
    throw new ApiError(
      res.status,
      `API ${res.status} ${res.statusText}`,
      bodyText,
    );
  }

  return (await res.json()) as T;
}

export function getHealth(init?: FetchInit): Promise<HailLeadsHealth> {
  return request<HailLeadsHealth>("/v1/hail-leads/health", init);
}
