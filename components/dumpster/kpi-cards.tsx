"use client";

import { AlertTriangle, Calendar, CalendarClock, Layers, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CachedDumpsterStats } from "@/lib/dumpster-cache";
import type { DumpsterLead } from "@/lib/dumpster-types";
import { formatGeneratedAt } from "@/components/cache-banner";

type Props =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      stats: CachedDumpsterStats;
      leads: DumpsterLead[];
    };

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
  if (!iso) return { label: "—", sub: "no permits yet" };
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

const CATEGORY_LABELS: Record<string, string> = {
  reroof: "Reroof",
  roof_other: "Roof other",
  demolition: "Demolition",
  new_construction: "New construction",
  addition: "Addition",
  remodel: "Remodel",
  pool: "Pool",
  other: "Other",
};

function topCategory(leads: DumpsterLead[]): { label: string; count: number } {
  if (leads.length === 0) return { label: "—", count: 0 };
  const counts = new Map<string, number>();
  for (const l of leads) {
    const key = l.category || "other";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bestKey = "";
  let best = 0;
  for (const [k, v] of counts) {
    if (v > best) {
      best = v;
      bestKey = k;
    }
  }
  return {
    label: CATEGORY_LABELS[bestKey] ?? bestKey.replace(/_/g, " "),
    count: best,
  };
}

export function DumpsterKpiCards(props: Props) {
  if (props.status === "loading") {
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

  if (props.status === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-medium">Couldn&apos;t load headline stats</div>
          <div className="mt-0.5 text-sm text-amber-800">{props.message}</div>
        </div>
      </div>
    );
  }

  const { stats, leads } = props;
  const top = topCategory(leads);
  const latest = formatRelativeDays(stats.latest_permit_date);

  const cards: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    accent: string;
  }[] = [
    {
      icon: <Truck className="h-5 w-5" />,
      label: "Total leads (30d)",
      value: formatBigNumber(stats.total_leads_30d),
      sub: "in service area",
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      label: "This week",
      value: formatBigNumber(stats.fresh_leads_this_week),
      sub: "permits issued last 7 days",
      accent: "bg-sky-50 text-sky-600",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: "Top category (30d)",
      value: top.label,
      sub: top.count > 0 ? `${top.count} leads` : "—",
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Latest permit",
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
 * Compact "As of <time>" pill. Mirrors the hail-leads version so callers
 * who only import from this module don't need both.
 */
export function DumpsterAsOfPill({
  generatedAt,
}: {
  generatedAt: string | null | undefined;
}) {
  if (!generatedAt) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
      As of {formatGeneratedAt(generatedAt)}
    </span>
  );
}
