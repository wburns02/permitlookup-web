"use client";

import { AlertTriangle, Database } from "lucide-react";
import { cn } from "@/lib/utils";

export type CacheBannerState = "info" | "warning" | "hidden";

type Props = {
  state: CacheBannerState;
  generatedAt?: string | null;
};

/**
 * Format an ISO timestamp as "MMM d, h:mm a" in the user's local TZ.
 * Falls back to the raw string if it can't be parsed.
 */
export function formatGeneratedAt(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Two-state banner sitting above the dashboard:
 *   - "info"    : we're showing the cached overnight feed (gray).
 *   - "warning" : we tried the live API and it failed; cache is on screen
 *                 because the live endpoint is unavailable (amber).
 */
export function CacheBanner({ state, generatedAt }: Props) {
  if (state === "hidden") return null;

  const when = formatGeneratedAt(generatedAt);

  if (state === "warning") {
    return (
      <div
        role="status"
        className={cn(
          "mb-6 flex items-start gap-3 rounded-md border p-3 text-sm",
          "border-amber-200 bg-amber-50 text-amber-800",
        )}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <div>
          Live data unavailable — showing latest cache (last refreshed at{" "}
          <span className="font-medium">{when}</span>).
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={cn(
        "mb-6 flex items-start gap-3 rounded-md border p-3 text-sm",
        "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      <Database className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <div>
        Showing cached feed, refreshed at{" "}
        <span className="font-medium text-slate-900">{when}</span>. Apply a
        filter for live data.
      </div>
    </div>
  );
}
