"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DumpsterAnalyticsFunnel } from "./types";

type Props = {
  funnel: DumpsterAnalyticsFunnel;
  loading: boolean;
};

const STEPS: Array<{
  key: keyof DumpsterAnalyticsFunnel;
  label: string;
  bar: string;
}> = [
  { key: "gate_unlock",  label: "Gate unlock",  bar: "bg-indigo-600" },
  { key: "page_view",    label: "Page view",    bar: "bg-indigo-500" },
  { key: "filter_apply", label: "Filter apply", bar: "bg-sky-500" },
  { key: "lead_click",   label: "Lead click",   bar: "bg-emerald-500" },
  { key: "phone_tap",    label: "Phone tap",    bar: "bg-emerald-600" },
];

function pct(numerator: number, denominator: number): string {
  if (!denominator || denominator <= 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export function DumpsterFunnel({ funnel, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  // Use the largest step as the bar reference so visual proportions feel
  // intuitive even when steps are tiny / zero.
  const counts = STEPS.map((s) => Number(funnel?.[s.key] ?? 0));
  const maxCount = Math.max(1, ...counts);

  return (
    <div className="space-y-3">
      {STEPS.map((step, i) => {
        const count = counts[i];
        const prev = i > 0 ? counts[i - 1] : null;
        const widthPct = Math.max(2, (count / maxCount) * 100);
        const conversion = prev !== null ? pct(count, prev) : null;
        const subText =
          prev !== null
            ? conversion === "—"
              ? `${count.toLocaleString()} sessions`
              : `${count.toLocaleString()} sessions · ${conversion} of ${STEPS[i - 1].label.toLowerCase()}`
            : `${count.toLocaleString()} sessions`;
        return (
          <div key={step.key}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-slate-700">{step.label}</span>
              <span className="text-xs text-slate-500">{subText}</span>
            </div>
            <div className="h-9 w-full overflow-hidden rounded-md bg-slate-100">
              <div
                className={cn(
                  "flex h-full items-center justify-end px-3 text-xs font-semibold text-white transition-all",
                  step.bar,
                )}
                style={{ width: `${widthPct}%` }}
              >
                {count > 0 && (
                  <span className="tabular-nums">{count.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
