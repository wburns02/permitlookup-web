"use client";

import { AlertTriangle, CloudLightning, CloudRain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HailLeadsHealth, StormSourceFreshness } from "@/lib/health";

type State =
  | { status: "loading" }
  | { status: "ok"; data: HailLeadsHealth }
  | { status: "error"; message: string };

function formatDaysSince(days: number | null | undefined): string {
  if (days === null || days === undefined || !Number.isFinite(days)) {
    return "—";
  }
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

function formatLatestDate(iso: string | null): string {
  if (!iso) return "no reports yet";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function freshnessClasses(days: number | null | undefined): {
  pill: string;
  dot: string;
  label: string;
} {
  if (days === null || days === undefined || !Number.isFinite(days)) {
    return {
      pill: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      label: "missing",
    };
  }
  if (days <= 1) {
    return {
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "fresh",
    };
  }
  if (days <= 2) {
    return {
      pill: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "stale",
    };
  }
  return {
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    label: "missing",
  };
}

function sourceIcon(name: string) {
  if (name === "spc_storm_reports") {
    return <CloudLightning className="h-5 w-5" />;
  }
  return <CloudRain className="h-5 w-5" />;
}

function StormCard({ s }: { s: StormSourceFreshness }) {
  const f = freshnessClasses(s.days_since);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          {sourceIcon(s.source)}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
            f.pill,
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", f.dot)} />
          {f.label}
        </span>
      </div>

      <div className="mt-5">
        <div className="font-mono text-sm text-slate-500">{s.source}</div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          {formatDaysSince(s.days_since)}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          latest report · {formatLatestDate(s.latest_report_date)}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last 7d
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {s.rows_last_7d.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Last 30d
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {s.rows_last_30d.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RecentStormsStrip({ state }: { state: State }) {
  if (state.status === "loading") {
    return (
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="mt-5 h-4 w-32" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-3 h-3 w-40" />
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
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
          <div className="font-medium">Couldn&apos;t load storm sources</div>
          <div className="mt-0.5 text-sm text-amber-800">{state.message}</div>
        </div>
      </div>
    );
  }

  const sources = state.data.storm_sources;

  if (sources.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        No storm sources reported.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {sources.map((s) => (
        <StormCard key={s.source} s={s} />
      ))}
    </div>
  );
}
