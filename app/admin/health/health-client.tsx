"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { CronHeartbeatTable } from "@/components/cron-heartbeat-table";
import { HealthKpis } from "@/components/health-kpis";
import { RecentStormsStrip } from "@/components/recent-storms-strip";
import { getHealth, type HailLeadsHealth } from "@/lib/health";

type State =
  | { status: "loading" }
  | { status: "ok"; data: HailLeadsHealth }
  | { status: "error"; message: string };

function formatFetchedAt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HealthDashboard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: err.message || "Failed to load health data",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const generatedAt =
    state.status === "ok" ? state.data.generated_at : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
            <Activity className="h-3.5 w-3.5" />
            Live system health · auto-refreshes overnight
          </span>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            System Health
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Materialized-view freshness, storm-source load times, fresh-leads
            counts, and per-cron heartbeats for the hail-leads pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Last fetched</span>
          <span className="text-slate-400">·</span>
          <span>{formatFetchedAt(generatedAt)}</span>
        </div>
      </header>

      <div className="space-y-8">
        {/* KPIs */}
        <section>
          <HealthKpis state={state} />
        </section>

        {/* Storm sources */}
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Storm sources
            </h2>
            <span className="text-xs text-slate-500">
              latest report · 7d / 30d row counts
            </span>
          </div>
          <RecentStormsStrip state={state} />
        </section>

        {/* Crons */}
        <section>
          <CronHeartbeatTable state={state} />
        </section>
      </div>
    </div>
  );
}
