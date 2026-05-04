"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BarChart3, RefreshCw, Zap } from "lucide-react";
import { AdminDumpsterKpiCards } from "@/components/admin/dumpster/kpi-cards";
import { DumpsterSessionsChart } from "@/components/admin/dumpster/sessions-chart";
import { DumpsterFunnel } from "@/components/admin/dumpster/funnel";
import { DumpsterGeoTable } from "@/components/admin/dumpster/geo-table";
import { DumpsterHotLeads } from "@/components/admin/dumpster/hot-leads";
import { DumpsterLiveFeed } from "@/components/admin/dumpster/live-feed";
import { formatGeneratedAt } from "@/components/cache-banner";
import type { DumpsterAnalyticsPayload } from "@/components/admin/dumpster/types";

const EMPTY: DumpsterAnalyticsPayload = {
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
  generated_at: null,
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const ROLLUP_REFRESH_MS = 60_000;       // background full-rollup refresh
const LIVE_FEED_REFRESH_MS = 10_000;    // live-feed-only refresh

export function DumpsterAnalyticsDashboard() {
  const [data, setData] = useState<DumpsterAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingNow, setRefreshingNow] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async (opts?: { liveOnly?: boolean }) => {
    try {
      const liveOnly = !!opts?.liveOnly;
      if (!liveOnly) setRefreshingNow(true);
      const res = await fetch("/api/admin/dumpster-analytics", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Upstream ${res.status}`);
      }
      const next = (await res.json()) as DumpsterAnalyticsPayload;
      setData((prev) => {
        // For live-only refreshes, keep prior data and only swap the live feed
        // + last_event_at so the chart/funnel don't flicker.
        if (liveOnly && prev) {
          return {
            ...prev,
            live_feed: next.live_feed ?? prev.live_feed,
            kpis: { ...prev.kpis, last_event_at: next.kpis?.last_event_at ?? prev.kpis.last_event_at },
            generated_at: next.generated_at ?? prev.generated_at,
          };
        }
        return next ?? EMPTY;
      });
      setError(null);
      lastFetchRef.current = Date.now();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData((prev) => prev ?? EMPTY);
    } finally {
      setLoading(false);
      setRefreshingNow(false);
    }
  }, []);

  // Initial fetch.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background refresh: every 60s for the full rollup, every 10s for the
  // live feed only. setInterval keeps the page warm without hammering the
  // upstream.
  useEffect(() => {
    const rollupTimer = setInterval(() => {
      fetchData();
    }, ROLLUP_REFRESH_MS);
    const liveTimer = setInterval(() => {
      fetchData({ liveOnly: true });
    }, LIVE_FEED_REFRESH_MS);
    return () => {
      clearInterval(rollupTimer);
      clearInterval(liveTimer);
    };
  }, [fetchData]);

  const payload = data ?? EMPTY;
  const isEmpty =
    !loading &&
    payload.kpis.events_24h === 0 &&
    payload.live_feed.length === 0 &&
    payload.series.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
            <BarChart3 className="h-3.5 w-3.5" />
            Internal · auto-refresh
          </span>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Dumpster Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Traffic, geography, and interaction funnel for the dumpster-leads
            demo. Snapshot regenerates every 5 minutes; live feed polls every
            10 seconds.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="text-right">
            <div>
              <span className="font-medium text-slate-700">As of</span>{" "}
              {formatGeneratedAt(payload.generated_at)}
            </div>
            <div className="text-[11px] text-slate-400">Refreshes every 5 min</div>
          </div>
          <button
            type="button"
            onClick={() => fetchData()}
            disabled={refreshingNow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshingNow ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Upstream snapshot unreachable: {error}. Showing the last good payload.
        </div>
      )}

      {isEmpty && !error && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <Zap className="h-4 w-4 text-slate-400" />
          No events yet — track an interaction first.
        </div>
      )}

      {/* KPIs */}
      <section className="mb-8">
        <AdminDumpsterKpiCards
          status={loading && !data ? "loading" : "ok"}
          kpis={payload.kpis}
        />
      </section>

      {/* Sessions chart */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Sessions &amp; Visitors
              </h2>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </div>
          </div>
          <DumpsterSessionsChart
            series={payload.series}
            loading={loading && !data}
          />
        </div>
      </section>

      {/* Funnel */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Funnel
            </h2>
            <p className="text-xs text-slate-500">Last 7 days · unique sessions per step</p>
          </div>
          <DumpsterFunnel funnel={payload.funnel} loading={loading && !data} />
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Top cities
            </h2>
            <p className="text-xs text-slate-500">Last 30 days · top 20</p>
          </div>
          <DumpsterGeoTable rows={payload.geo} loading={loading && !data} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Hot leads
            </h2>
            <p className="text-xs text-slate-500">Last 7 days · most-clicked, top 20</p>
          </div>
          <DumpsterHotLeads
            rows={payload.hot_leads}
            loading={loading && !data}
          />
        </div>
      </section>

      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Live feed
              </h2>
              <p className="text-xs text-slate-500">
                Last 50 events · polls every 10s
              </p>
            </div>
          </div>
          <DumpsterLiveFeed
            rows={payload.live_feed}
            loading={loading && !data}
          />
        </div>
      </section>
    </div>
  );
}
