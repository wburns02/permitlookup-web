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
import type { DumpsterAnalyticsGeoRow } from "./types";

type Props = {
  rows: DumpsterAnalyticsGeoRow[];
  loading: boolean;
};

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
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

function formatLocation(r: DumpsterAnalyticsGeoRow): string {
  const parts = [r.geo_city, r.geo_region, r.geo_country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

export function DumpsterGeoTable({ rows, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-sm text-slate-500">
        No geographic sessions yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
            <TableHead className="text-right">Last seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.geo_city ?? "?"}-${r.geo_region ?? "?"}-${i}`}>
              <TableCell className="font-medium text-slate-800">
                {formatLocation(r)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-slate-700">
                {Number(r.sessions ?? 0).toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-xs text-slate-500">
                {formatRelative(r.last_seen)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
