"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { DumpsterAnalyticsSeriesRow } from "./types";

type Props = {
  series: DumpsterAnalyticsSeriesRow[];
  loading: boolean;
};

function formatXAxis(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DumpsterSessionsChart({ series, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[260px] w-full" />
      </div>
    );
  }

  if (!series || series.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-500">
        No sessions in the last 30 days yet.
      </div>
    );
  }

  // Coerce numeric strings (psql json_agg returns numeric → strings sometimes).
  const data = series.map((r) => ({
    date: r.date,
    sessions: Number(r.sessions ?? 0),
    visitors: Number(r.visitors ?? 0),
  }));

  return (
    <div className="h-[280px] w-full md:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: -12 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            labelFormatter={(label) =>
              typeof label === "string" ? formatXAxis(label) : String(label)
            }
          />
          <Line
            type="monotone"
            dataKey="sessions"
            name="Sessions"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "#4f46e5", strokeWidth: 2, fill: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-500">
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm bg-indigo-600" /> Sessions
        </div>
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" /> Visitors
        </div>
      </div>
    </div>
  );
}
