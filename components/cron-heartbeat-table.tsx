"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type { CronHeartbeat, CronStatus, HailLeadsHealth } from "@/lib/health";

type State =
  | { status: "loading" }
  | { status: "ok"; data: HailLeadsHealth }
  | { status: "error"; message: string };

const STATUS_CLASSES: Record<CronStatus, string> = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  stale: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatHoursAgo(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) {
    return "never";
  }
  if (hours < 1) {
    const mins = Math.max(1, Math.round(hours * 60));
    return `${mins}m ago`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1).replace(/\.0$/, "")}h ago`;
  }
  const days = Math.floor(hours / 24);
  return days === 1 ? "1d ago" : `${days}d ago`;
}

function formatAbsoluteTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CronHeartbeatTable({ state }: { state: State }) {
  if (state.status === "loading") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="font-medium">Couldn&apos;t load cron heartbeats</div>
          <div className="mt-0.5 text-sm text-amber-800">{state.message}</div>
        </div>
      </div>
    );
  }

  const crons: CronHeartbeat[] = state.data.crons;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Cron heartbeats
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Last-seen timestamps for the recurring backend jobs that keep this
          pipeline fresh.
        </p>
      </div>

      {crons.length === 0 ? (
        <div className="px-6 py-8 text-sm text-slate-500">
          No crons reported.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
              <TableHead className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Name
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Last seen
              </TableHead>
              <TableHead className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crons.map((c) => (
              <TableRow
                key={c.name}
                className="border-b border-slate-100 transition hover:bg-slate-50"
              >
                <TableCell className="px-6 py-4 font-medium text-slate-900">
                  {c.name}
                </TableCell>
                <TableCell className="px-6 py-4 text-slate-700">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">
                      {formatHoursAgo(c.hours_since)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatAbsoluteTimestamp(c.last_seen_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={cn(
                      "border px-2.5 py-0.5 text-xs font-medium capitalize",
                      STATUS_CLASSES[c.status],
                    )}
                  >
                    {c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
