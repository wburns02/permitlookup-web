/**
 * Thin typed fetch client for the PermitLookup hail-leads API.
 *
 * - Auth: X-API-Key header from NEXT_PUBLIC_DEMO_API_KEY
 * - Base: NEXT_PUBLIC_API_BASE
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://permit-api-production-6eae.up.railway.app";
const API_KEY = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

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
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers ?? {}),
  };
  if (API_KEY) headers["X-API-Key"] = API_KEY;

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

export function getHailLeadsStats(init?: FetchInit): Promise<HailLeadsStats> {
  return request<HailLeadsStats>("/v1/hail-leads/stats", init);
}

export function getHailLeadsList(
  filters: HailLeadsFilters = {},
  init?: FetchInit,
): Promise<HailLeadListResponse> {
  const qs = filtersToSearchParams(filters).toString();
  const path = `/v1/hail-leads/${qs ? `?${qs}` : ""}`;
  return request<HailLeadListResponse>(path, init);
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
  const url = `${API_BASE}/v1/hail-leads/export.csv${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: API_KEY ? { "X-API-Key": API_KEY } : {},
  });
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
