"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Cloud, CloudRain, Home, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getHailLeadsStatsCached } from "@/lib/api";
import type { CachedHailLeadsStats } from "@/lib/cache";
import { formatGeneratedAt } from "./cache-banner";

type State =
  | { status: "loading" }
  | { status: "ok"; data: CachedHailLeadsStats }
  | { status: "error"; message: string };

function formatBigNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
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

function formatRelativeDays(iso: string | null): {
  label: string;
  sub: string;
} {
  if (!iso) return { label: "—", sub: "no storms yet" };
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return { label: iso, sub: "" };
  const today = new Date();
  const days = Math.floor(
    (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  const label = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const sub =
    days <= 0
      ? "today"
      : days === 1
        ? "1 day ago"
        : days < 30
          ? `${days} days ago`
          : days < 365
            ? `${Math.floor(days / 30)} mo ago`
            : `${Math.floor(days / 365)} yr ago`;
  return { label, sub };
}

export function KpiCards() {
  // Default fetch path is the static cache. The cache module returns
  // FALLBACK constants if the network is unreachable, so this should
  // virtually never end up in the "error" state.
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    getHailLeadsStatsCached()
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({
            status: "error",
            message: err.message || "Failed to load stats",
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-9 w-32" />
            <Skeleton className="mt-3 h-3 w-36" />
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
          <div className="font-medium">Couldn&apos;t load headline stats</div>
          <div className="mt-0.5 text-sm text-amber-800">{state.message}</div>
        </div>
      </div>
    );
  }

  const { data } = state;
  const latest = formatRelativeDays(data.latest_storm_date);

  const cards: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    accent: string;
  }[] = [
    {
      icon: <CloudRain className="h-5 w-5" />,
      label: "Total leads",
      value: formatBigNumber(data.total_leads),
      sub: "storm × permit matches",
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <Home className="h-5 w-5" />,
      label: "Unique addresses",
      value: formatBigNumber(data.unique_addresses),
      sub: "in hail footprints",
      accent: "bg-sky-50 text-sky-600",
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Counties covered",
      value: formatBigNumber(data.counties_covered),
      sub: "Central TX core",
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      label: "Latest storm",
      value: latest.label,
      sub: latest.sub ? `${latest.sub} · freshest signal` : "freshest signal",
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-1.5 text-sm text-slate-500">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact "As of <time>" pill. Used in the dashboard header to advertise
 * the freshness of whatever data we're currently showing.
 */
export function AsOfPill({ generatedAt }: { generatedAt: string | null | undefined }) {
  if (!generatedAt) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
      As of {formatGeneratedAt(generatedAt)}
    </span>
  );
}
