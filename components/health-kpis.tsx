"use client";

import { AlertTriangle, Database, CloudRain, Sparkles, Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  CoverageStat,
  FreshLeadsCounts,
  HailLeadsHealth,
  MaterializedViewFreshness,
  StormSourceFreshness,
} from "@/lib/health";

type State =
  | { status: "loading" }
  | { status: "ok"; data: HailLeadsHealth }
  | { status: "error"; message: string };

type Freshness = "fresh" | "stale" | "missing";

function classifyHours(hours: number | null | undefined): Freshness {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) {
    return "missing";
  }
  if (hours < 26) return "fresh";
  if (hours <= 50) return "stale";
  return "missing";
}

function freshnessLabel(f: Freshness): string {
  if (f === "fresh") return "fresh";
  if (f === "stale") return "stale";
  return "stale or missing";
}

function dotClass(f: Freshness): string {
  if (f === "fresh") return "bg-emerald-500";
  if (f === "stale") return "bg-amber-500";
  return "bg-rose-500";
}

function formatBigNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v >= 100 ? v.toFixed(0) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString();
}

function pickPrimaryMv(
  mvs: MaterializedViewFreshness[],
): MaterializedViewFreshness | null {
  if (mvs.length === 0) return null;
  return mvs.find((m) => m.name === "hail_leads") ?? mvs[0];
}

function pickPrimaryStorm(
  sources: StormSourceFreshness[],
): StormSourceFreshness | null {
  if (sources.length === 0) return null;
  // Prefer the one with the most recent report; fall back to first.
  let best: StormSourceFreshness | null = null;
  for (const s of sources) {
    if (s.days_since === null || s.days_since === undefined) continue;
    if (!best || (best.days_since ?? Infinity) > s.days_since) {
      best = s;
    }
  }
  return best ?? sources[0];
}

function pickPrimaryCoverage(coverage: CoverageStat[]): CoverageStat | null {
  if (coverage.length === 0) return null;
  return (
    coverage.find((c) => c.name === "hail_leads_enriched") ?? coverage[0]
  );
}

function freshLeadsSubLabel(fl: FreshLeadsCounts): {
  freshness: Freshness;
  sub: string;
} {
  const f: Freshness =
    fl.this_week > 0 ? "fresh" : fl.last_30d > 0 ? "stale" : "missing";
  return {
    freshness: f,
    sub: `${fl.last_30d.toLocaleString()} in last 30d`,
  };
}

export function HealthKpis({ state }: { state: State }) {
  if (state.status === "loading") {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-9 w-32" />
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-medium">Couldn&apos;t load health KPIs</div>
          <div className="mt-0.5 text-sm text-amber-800">{state.message}</div>
        </div>
      </div>
    );
  }

  const { data } = state;
  const mv = pickPrimaryMv(data.materialized_views);
  const storm = pickPrimaryStorm(data.storm_sources);
  const coverage = pickPrimaryCoverage(data.coverage);
  const fl = data.fresh_leads;
  const flSub = freshLeadsSubLabel(fl);

  const mvFreshness = classifyHours(mv?.hours_since_data ?? null);
  const stormFreshness =
    storm && storm.days_since !== null && storm.days_since !== undefined
      ? storm.days_since <= 1
        ? "fresh"
        : storm.days_since <= 2
          ? "stale"
          : "missing"
      : "missing";

  const coveragePct = coverage?.percent_covered ?? 0;
  const coverageFreshness: Freshness =
    coveragePct >= 50 ? "fresh" : coveragePct >= 10 ? "stale" : "missing";

  const cards: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    accent: string;
    freshness: Freshness;
  }[] = [
    {
      icon: <Database className="h-5 w-5" />,
      label: "MV freshness",
      value:
        mv && mv.hours_since_data !== null && mv.hours_since_data !== undefined
          ? `${mv.hours_since_data.toFixed(1)}h`
          : "—",
      sub: mv
        ? `${formatBigNumber(mv.row_count)} rows · ${mv.name}`
        : "no MV reported",
      accent: "bg-indigo-50 text-indigo-600",
      freshness: mvFreshness,
    },
    {
      icon: <CloudRain className="h-5 w-5" />,
      label: "Latest storm",
      value:
        storm && storm.days_since !== null && storm.days_since !== undefined
          ? storm.days_since === 0
            ? "today"
            : storm.days_since === 1
              ? "1d ago"
              : `${storm.days_since}d ago`
          : "—",
      sub: storm
        ? `${storm.source} · ${storm.rows_last_7d.toLocaleString()} in 7d`
        : "no storm source",
      accent: "bg-sky-50 text-sky-600",
      freshness: stormFreshness,
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: "Fresh leads",
      value: formatBigNumber(fl.this_week),
      sub: `this week · ${flSub.sub}`,
      accent: "bg-emerald-50 text-emerald-600",
      freshness: flSub.freshness,
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Enrichment coverage",
      value: coverage ? `${coveragePct.toFixed(1)}%` : "—",
      sub: coverage
        ? `${formatBigNumber(coverage.enriched_rows)} / ${formatBigNumber(coverage.total_addresses)}`
        : "no coverage data",
      accent: "bg-amber-50 text-amber-600",
      freshness: coverageFreshness,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-150 ease-in-out hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg",
                c.accent,
              )}
            >
              {c.icon}
            </div>
            <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {c.label}
            </div>
          </div>
          <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {c.value}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <span
              className={cn(
                "inline-block h-2 w-2 shrink-0 rounded-full",
                dotClass(c.freshness),
              )}
              aria-hidden="true"
            />
            <span>
              <span className="font-medium text-slate-700">
                {freshnessLabel(c.freshness)}
              </span>
              <span className="text-slate-400"> · </span>
              {c.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
