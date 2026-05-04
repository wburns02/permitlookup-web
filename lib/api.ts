/**
 * Thin typed fetch client for the PermitLookup hail-leads API.
 *
 * - Transport: same-origin Next route handler at `/api/hail-leads/*`
 *   (see `app/api/hail-leads/[[...path]]/route.ts`). The proxy adds the
 *   `X-API-Key` header server-side and forwards to Railway. Going same-origin
 *   sidesteps Railway's CORS allowlist (which doesn't include hail.ecbtx.com
 *   for the per-lead detail endpoint) and means we don't have to ship a
 *   server-side CORS fix while permit-api Railway auto-deploy is broken.
 * - Returns typed JSON; throws ApiError with status + message on non-2xx
 *
 * Next.js 16 fetch is uncached by default. Callers can pass `cache` / `next`
 * options through if they need caching.
 */

import type {
  HailLeadDetail,
  HailLeadListResponse,
  HailLeadsFilters,
  HailLeadsStats,
} from "./types";
import {
  getCachedDefaultLeads,
  getCachedStats,
  type CachedHailLeadListResponse,
  type CachedHailLeadsStats,
} from "./cache";

// Same-origin proxy. The route handler injects X-API-Key and forwards to
// `${NEXT_PUBLIC_API_BASE}/v1/hail-leads/...`.
const PROXY_BASE = "/api/hail-leads";

export class ApiError extends Error {
  status: number;
  body: string | null;

  constructor(status: number, message: string, body: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type FetchInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

async function request<T>(path: string, init: FetchInit = {}): Promise<T> {
  // `path` is the upstream path (e.g. "/v1/hail-leads/<id>"). We strip the
  // "/v1/hail-leads" prefix because our same-origin proxy is mounted at
  // "/api/hail-leads" and re-adds the upstream prefix server-side.
  const stripped = path.replace(/^\/v1\/hail-leads/, "");
  const url = `${PROXY_BASE}${stripped}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers ?? {}),
  };
  // No X-API-Key on the client: the proxy attaches it server-side.

  const res = await fetch(url, {
    ...init,
    headers,
    // Stay fresh by default — hail-lead data updates overnight.
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

// ---------------------------------------------------------------------------
// Filter encoding
// ---------------------------------------------------------------------------

/**
 * Serialize filters to a `URLSearchParams`, skipping undefined / empty values.
 * Exposed so callers can reuse the same encoding for export.csv downloads.
 */
export function filtersToSearchParams(
  filters: HailLeadsFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const keys: (keyof HailLeadsFilters)[] = [
    "county",
    "from_date",
    "to_date",
    "category",
    "min_hail_inches",
    "min_days_after",
    "max_days_after",
    "page",
    "page_size",
    "sort",
  ];
  for (const key of keys) {
    const v = filters[key];
    if (v === undefined || v === null || v === "") continue;
    params.set(key, String(v));
  }
  return params;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Cache-aware mode
//
// When `useCacheIfAvailable` is true (and, for the list, no real filters
// have been set), we read the precomputed JSON snapshot R730 publishes
// hourly instead of hitting Railway. The cache module returns hardcoded
// FALLBACK constants if the cache itself is unreachable, so these
// `getHailLeads*WithCache` calls effectively never throw on the default
// path. Callers who *do* want the live API (filter applied, retry, etc.)
// continue using `getHailLeadsStats` / `getHailLeadsList`.
// ---------------------------------------------------------------------------

export function getHailLeadsStats(init?: FetchInit): Promise<HailLeadsStats> {
  return request<HailLeadsStats>("/v1/hail-leads/stats", init);
}

export function getHailLeadsStatsCached(
  signal?: AbortSignal,
): Promise<CachedHailLeadsStats> {
  return getCachedStats(signal);
}

export function getHailLeadsList(
  filters: HailLeadsFilters = {},
  init?: FetchInit,
): Promise<HailLeadListResponse> {
  const qs = filtersToSearchParams(filters).toString();
  const path = `/v1/hail-leads/${qs ? `?${qs}` : ""}`;
  return request<HailLeadListResponse>(path, init);
}

/**
 * True when no user-controllable filter has been set. Pagination + sort
 * are not "filters" for the purposes of cache-vs-live routing — the cache
 * snapshot is already sorted by score and the user clicking "next page"
 * shouldn't trigger an API roundtrip on the default unfiltered view.
 */
export function hasUserFilters(filters: HailLeadsFilters): boolean {
  return Boolean(
    filters.county ||
      filters.from_date ||
      filters.to_date ||
      filters.category ||
      filters.min_hail_inches !== undefined ||
      filters.min_days_after !== undefined ||
      filters.max_days_after !== undefined,
  );
}

/**
 * Cache-aware list fetch. If `forceCache` is true, OR no user filters
 * are set, return the cached default snapshot. Otherwise hit the live API.
 * Errors from the live API propagate so the caller can fall back to cache.
 */
export async function getHailLeadsListWithCache(
  filters: HailLeadsFilters,
  options: { forceCache?: boolean; signal?: AbortSignal } = {},
): Promise<CachedHailLeadListResponse> {
  const { forceCache = false, signal } = options;
  if (forceCache || !hasUserFilters(filters)) {
    return getCachedDefaultLeads(signal);
  }
  const live = await getHailLeadsList(filters, { signal });
  return live;
}

export function getHailLeadDetail(
  leadId: string,
  init?: FetchInit,
): Promise<HailLeadDetail> {
  return request<HailLeadDetail>(
    `/v1/hail-leads/${encodeURIComponent(leadId)}`,
    init,
  );
}

/**
 * Return a fully-qualified URL for the CSV export. We let the browser GET it
 * directly so the file downloads the normal way (headers preserved) — but the
 * browser can't set X-API-Key on a plain <a href>, so we fetch it ourselves
 * and spawn a blob download.
 */
export async function downloadHailLeadsCsv(
  filters: Omit<HailLeadsFilters, "page" | "page_size">,
): Promise<void> {
  const qs = filtersToSearchParams({ ...filters }).toString();
  // Same-origin proxy. The route handler attaches X-API-Key server-side
  // and preserves Content-Disposition so the file naming below still works.
  const url = `${PROXY_BASE}/export.csv${qs ? `?${qs}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw new ApiError(
      res.status,
      `CSV export ${res.status} ${res.statusText}`,
      body,
    );
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  // Filename from Content-Disposition if available, else synthesize.
  const cd = res.headers.get("Content-Disposition") || "";
  const m = cd.match(/filename="?([^";]+)"?/i);
  a.download = m?.[1] ?? `hail-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}
