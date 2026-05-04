"use client";

import { Activity, Clock, Eye, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DumpsterAnalyticsKpis } from "./types";

type Props =
  | { status: "loading" }
  | { status: "ok"; kpis: DumpsterAnalyticsKpis };

function formatBigNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n) || n < 0) return "—";
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

function formatRelative(iso: string | null): { label: string; sub: string } {
  if (!iso) return { label: "—", sub: "no events yet" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { label: iso, sub: "" };
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  let sub: string;
  if (diffSec < 60) sub = `${diffSec}s ago`;
  else if (diffMin < 60) sub = `${diffMin}m ago`;
  else if (diffHr < 24) sub = `${diffHr}h ago`;
  else sub = `${diffDay}d ago`;

  const label = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { label, sub };
}

export function AdminDumpsterKpiCards(props: Props) {
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

  const { kpis } = props;
  const last = formatRelative(kpis.last_event_at);

  const cards: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    accent: string;
  }[] = [
    {
      icon: <Users className="h-5 w-5" />,
      label: "Visitors today",
      value: formatBigNumber(kpis.visitors_today),
      sub: "unique visitor IDs",
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Sessions today",
      value: formatBigNumber(kpis.sessions_today),
      sub: "unique session IDs",
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      label: "Events (24h)",
      value: formatBigNumber(kpis.events_24h),
      sub: "all event types",
      accent: "bg-sky-50 text-sky-600",
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: "Last event",
      value: last.label,
      sub: last.sub || "—",
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
