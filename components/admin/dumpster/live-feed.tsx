"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DumpsterAnalyticsLiveFeedRow } from "./types";

type Props = {
  rows: DumpsterAnalyticsLiveFeedRow[];
  loading: boolean;
};

const EVENT_TYPE_PILL: Record<string, string> = {
  page_view: "bg-slate-100 text-slate-700",
  gate_unlock: "bg-indigo-100 text-indigo-700",
  filter_apply: "bg-sky-100 text-sky-700",
  lead_click: "bg-emerald-100 text-emerald-700",
  phone_tap: "bg-emerald-200 text-emerald-800",
  smoke_local: "bg-amber-100 text-amber-700",
};

function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatPayload(
  payload: Record<string, unknown> | null,
  path: string | null,
): string {
  const parts: string[] = [];
  if (payload && typeof payload === "object") {
    if (typeof payload.lead_id === "string") {
      parts.push(`lead=${(payload.lead_id as string).slice(0, 8)}`);
    }
    if (typeof payload.grade === "string") {
      parts.push(`grade=${payload.grade}`);
    }
    if (typeof payload.filter === "string") {
      parts.push(`filter=${payload.filter}`);
    }
    if (typeof payload.value === "string" || typeof payload.value === "number") {
      parts.push(`val=${String(payload.value).slice(0, 16)}`);
    }
    if (parts.length === 0) {
      const json = JSON.stringify(payload);
      if (json && json !== "{}") {
        parts.push(json.length > 40 ? json.slice(0, 37) + "…" : json);
      }
    }
  }
  if (parts.length === 0 && path) {
    parts.push(path);
  }
  return parts.join(" · ");
}

function formatCity(row: DumpsterAnalyticsLiveFeedRow): string {
  const parts = [row.geo_city, row.geo_country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function DumpsterLiveFeed({ rows, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-sm text-slate-500">
        No events captured yet.
      </div>
    );
  }

  return (
    <div className="max-h-[480px] overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead className="w-24">When</TableHead>
            <TableHead className="w-40">Event</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => {
            const pillClass =
              EVENT_TYPE_PILL[r.event_type] ?? "bg-slate-100 text-slate-700";
            return (
              <TableRow
                key={`${r.created_at}-${r.event_type}-${i}`}
                className="text-sm"
              >
                <TableCell
                  className="text-xs text-slate-500 tabular-nums"
                  title={r.created_at}
                >
                  {formatRelative(r.created_at)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                      pillClass,
                    )}
                  >
                    {r.event_type}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {formatCity(r)}
                </TableCell>
                <TableCell className="max-w-[40ch] truncate text-xs text-slate-500">
                  {formatPayload(r.event_payload, r.path)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
