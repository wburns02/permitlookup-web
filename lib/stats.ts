import { getCachedStats } from "./cache";

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
  refresh: "Hourly",
};

function formatCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

/**
 * Pulls hail-lead stats from the R730 static cache (Tailscale Funnel,
 * refreshed hourly). Returns hardcoded fallbacks if the cache is
 * unreachable — the landing page must render either way and the live
 * Railway API is intentionally NOT consulted here.
 */
export async function getHailStats(): Promise<HailStats> {
  try {
    const data = await getCachedStats();
    return {
      matches:
        data.total_leads != null
          ? formatCount(data.total_leads)
          : FALLBACK.matches,
      addresses:
        data.unique_addresses != null
          ? formatCount(data.unique_addresses)
          : FALLBACK.addresses,
      counties:
        data.counties_covered != null
          ? String(data.counties_covered)
          : FALLBACK.counties,
      refresh: FALLBACK.refresh,
    };
  } catch {
    return FALLBACK;
  }
}
