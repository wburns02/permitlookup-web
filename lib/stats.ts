export type HailStats = {
  matches: string;
  addresses: string;
  counties: string;
  refresh: string;
};

const FALLBACK: HailStats = {
  matches: "17M",
  addresses: "862K",
  counties: "5",
  refresh: "Daily",
};

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

/**
 * Pulls live hail-lead stats from the API. Returns hard-coded fallbacks if the
 * endpoint is unreachable or returns a non-2xx response — the landing page
 * must render either way.
 */
export async function getHailStats(): Promise<HailStats> {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) return FALLBACK;

  try {
    const res = await fetch(`${base}/v1/hail-leads/stats`, {
      headers: process.env.NEXT_PUBLIC_DEMO_API_KEY
        ? { "X-API-Key": process.env.NEXT_PUBLIC_DEMO_API_KEY }
        : undefined,
      // Next 16: fetch is uncached by default — this stays fresh each request.
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as {
      total_matches?: number;
      unique_addresses?: number;
      counties?: number | string[];
      refresh_cadence?: string;
    };

    const counties = Array.isArray(data.counties)
      ? String(data.counties.length)
      : data.counties != null
        ? String(data.counties)
        : FALLBACK.counties;

    return {
      matches:
        data.total_matches != null
          ? formatCount(data.total_matches)
          : FALLBACK.matches,
      addresses:
        data.unique_addresses != null
          ? formatCount(data.unique_addresses)
          : FALLBACK.addresses,
      counties,
      refresh: data.refresh_cadence ?? FALLBACK.refresh,
    };
  } catch {
    return FALLBACK;
  }
}
