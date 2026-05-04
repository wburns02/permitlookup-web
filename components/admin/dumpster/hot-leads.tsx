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
import type { DumpsterAnalyticsHotLead } from "./types";

type Props = {
  rows: DumpsterAnalyticsHotLead[];
  loading: boolean;
};

const GRADE_PILL: Record<string, string> = {
  A: "bg-emerald-600 text-white",
  B: "bg-indigo-600 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-orange-500 text-white",
  F: "bg-slate-400 text-white",
};

function truncateUuid(s: string | null): string {
  if (!s) return "—";
  if (s.length <= 12) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

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

export function DumpsterHotLeads({ rows, loading }: Props) {
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
        No lead clicks in the last 7 days yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead ID</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Last clicked</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => {
            const gradeKey = (r.grade ?? "").toUpperCase();
            const gradeClass = GRADE_PILL[gradeKey];
            return (
              <TableRow key={`${r.lead_id ?? "?"}-${i}`}>
                <TableCell
                  className="font-mono text-xs text-slate-700"
                  title={r.lead_id ?? undefined}
                >
                  {truncateUuid(r.lead_id)}
                </TableCell>
                <TableCell>
                  {gradeClass ? (
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold shadow-sm",
                        gradeClass,
                      )}
                      title={`Grade ${gradeKey}`}
                    >
                      {gradeKey}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold text-slate-800">
                  {Number(r.clicks ?? 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-xs text-slate-500">
                  {formatRelative(r.last_clicked)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
