"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getHailLeadsList,
  getHailLeadsListWithCache,
  hasUserFilters,
} from "@/lib/api";
import type { CachedHailLeadListResponse } from "@/lib/cache";
import type {
  HailLeadListItem,
  HailLeadListResponse,
  HailLeadsFilters,
} from "@/lib/types";
import { LeadDetailDrawer } from "./lead-detail-drawer";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function fmtAbsolute(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtHail(n: number | null): string {
  if (n == null) return "—";
  return `${n.toFixed(2)}"`;
}

const CATEGORY_COLORS: Record<string, string> = {
  roof_replace: "bg-emerald-100 text-emerald-800",
  siding: "bg-sky-100 text-sky-800",
  gutter: "bg-violet-100 text-violet-800",
  solar: "bg-amber-100 text-amber-800",
};

function CategoryBadge({ value }: { value: string | null }) {
  if (!value) return <Badge variant="secondary">—</Badge>;
  const label = value.replace(/_/g, " ");
  const cls = CATEGORY_COLORS[value] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        cls,
      )}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// State management
// ---------------------------------------------------------------------------

type Source = "cache" | "live" | "cache-after-error";

type State =
  | { status: "loading" }
  | {
      status: "ok";
      data: HailLeadListResponse | CachedHailLeadListResponse;
      source: Source;
    }
  | {
      status: "loading-with-prev";
      prev: HailLeadListResponse | CachedHailLeadListResponse;
      prevSource: Source;
    };

type Props = {
  filters: HailLeadsFilters;
  /**
   * Notifies the parent when our data source changes so the page can
   * sync the cache banner (info vs warning) and the "as of" pill.
   *
   * - "cache": default unfiltered render came from the static snapshot.
   * - "live": the live API responded successfully for the active filters.
   * - "cache-after-error": live API failed; we reverted to the cache.
   */
  onSourceChange?: (info: {
    source: Source;
    generatedAt?: string | null;
  }) => void;
};

export function LeadsTable({ filters, onSourceChange }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const sourceRef = useRef<Source | null>(null);

  const effectiveFilters: HailLeadsFilters = {
    ...filters,
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 50,
    sort: filters.sort ?? "score_desc",
  };

  // Serialize filters to a stable key for the effect dep.
  const filtersKey = JSON.stringify(effectiveFilters);
  const userFilterActive = hasUserFilters(effectiveFilters);

  useEffect(() => {
    let cancelled = false;

    // Preserve current rows during refetch (dimmed) — this is the "keep
    // cached rows visible while live request is in flight" behavior.
    setState((prev) => {
      if (prev.status === "ok") {
        return {
          status: "loading-with-prev",
          prev: prev.data,
          prevSource: prev.source,
        };
      }
      return prev.status === "loading-with-prev" ? prev : { status: "loading" };
    });

    function announce(source: Source, generatedAt?: string | null) {
      if (sourceRef.current !== source) {
        sourceRef.current = source;
        onSourceChange?.({ source, generatedAt: generatedAt ?? null });
      } else if (source === "cache" || source === "cache-after-error") {
        // Re-emit so the parent always has the freshest generated_at.
        onSourceChange?.({ source, generatedAt: generatedAt ?? null });
      }
    }

    if (!userFilterActive) {
      // Default path — pull the static cache. No live API call.
      getHailLeadsListWithCache(effectiveFilters)
        .then((data) => {
          if (cancelled) return;
          setState({ status: "ok", data, source: "cache" });
          announce("cache", data.generated_at ?? null);
        })
        .catch(() => {
          if (cancelled) return;
          // Cache module already returns FALLBACK constants on failure,
          // so this branch should be unreachable; keep it defensive.
          setState({ status: "loading" });
        });
      return () => {
        cancelled = true;
      };
    }

    // User has filters → hit the live API. On error, fall back to cache
    // and flip the banner to its warning state.
    getHailLeadsList(effectiveFilters)
      .then((data) => {
        if (cancelled) return;
        setState({ status: "ok", data, source: "live" });
        announce("live");
      })
      .catch(async () => {
        if (cancelled) return;
        // Quietly fall back to the cached snapshot. We don't surface a
        // toast — the parent banner says it instead.
        const cached = await getHailLeadsListWithCache(effectiveFilters, {
          forceCache: true,
        });
        if (cancelled) return;
        setState({ status: "ok", data: cached, source: "cache-after-error" });
        announce("cache-after-error", cached.generated_at ?? null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // First-paint loading: no previous rows to show — render skeleton.
  if (state.status === "loading") {
    return <TableSkeleton />;
  }

  const isRefetching = state.status === "loading-with-prev";
  const data = state.status === "ok" ? state.data : state.prev;

  if (data.results.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="text-base font-medium text-slate-900">
          No leads match these filters.
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Try widening the date range or adding a county.
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-opacity duration-200",
          isRefetching && "opacity-50",
        )}
        aria-busy={isRefetching || undefined}
      >
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 hover:bg-slate-50">
                <TableHead className="pl-5">Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Storm</TableHead>
                <TableHead>Hail</TableHead>
                <TableHead>Permit</TableHead>
                <TableHead>Lag</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Prior roofs</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="pr-5">Contractor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((r) => (
                <DesktopRow
                  key={r.lead_id}
                  row={r}
                  onClick={() => setSelectedLeadId(r.lead_id)}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile compact */}
        <ul className="divide-y divide-slate-100 md:hidden">
          {data.results.map((r) => (
            <li key={r.lead_id}>
              <button
                type="button"
                onClick={() => setSelectedLeadId(r.lead_id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">
                    {r.address ?? "Unknown"}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <CategoryBadge value={r.lead_category} />
                    <span>{fmtHail(r.hail_size_inches)}</span>
                    <span>·</span>
                    <span>{fmtRelative(r.storm_date)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-600">
                  View <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Pagination data={data} filters={effectiveFilters} />

      <LeadDetailDrawer
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </>
  );
}

function DesktopRow({
  row,
  onClick,
}: {
  row: HailLeadListItem;
  onClick: () => void;
}) {
  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-slate-50"
    >
      <TableCell className="pl-5 font-medium text-slate-900">
        <div className="max-w-[220px] truncate">{row.address ?? "—"}</div>
        {row.zip && (
          <div className="text-[11px] font-normal text-slate-400">
            {row.zip}
          </div>
        )}
      </TableCell>
      <TableCell className="text-slate-600">{row.city ?? "—"}</TableCell>
      <TableCell>
        <div className="text-slate-900">{fmtAbsolute(row.storm_date)}</div>
        <div className="text-[11px] text-slate-400">
          {fmtRelative(row.storm_date)}
        </div>
      </TableCell>
      <TableCell className="font-mono text-slate-900">
        {fmtHail(row.hail_size_inches)}
      </TableCell>
      <TableCell className="text-slate-700">
        {fmtAbsolute(row.permit_date)}
      </TableCell>
      <TableCell>
        {row.days_after_storm != null ? (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
            {row.days_after_storm}d
          </span>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell>
        <CategoryBadge value={row.lead_category} />
      </TableCell>
      <TableCell>
        {row.prior_roof_permits && row.prior_roof_permits > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            <ShieldAlert className="h-3 w-3" />
            {row.prior_roof_permits} prior
          </span>
        ) : (
          <span className="text-xs text-slate-400">0</span>
        )}
      </TableCell>
      <TableCell>
        {row.owner_enriched ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
            enriched
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </TableCell>
      <TableCell className="pr-5">
        <div className="max-w-[180px] truncate text-xs text-slate-600">
          {row.competitor_contractor ?? "—"}
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-0 divide-y divide-slate-100 p-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_0.6fr_1fr_0.5fr_1fr_1fr_0.8fr_1fr] items-center gap-3 px-3 py-3"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({
  data,
  filters,
}: {
  data: HailLeadListResponse | CachedHailLeadListResponse;
  filters: HailLeadsFilters;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [jump, setJump] = useState("");

  const page = data.page;
  const totalPages = data.total_pages;
  const total = data.total;

  function goto(p: number) {
    const next = Math.max(1, totalPages > 0 ? Math.min(p, totalPages) : p);
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(next));
    router.push(`/hail-leads?${params.toString()}`, { scroll: false });
  }

  const startIdx = (page - 1) * (filters.page_size ?? 50) + 1;
  const endIdx = Math.min(
    total >= 0 ? total : Infinity,
    page * (filters.page_size ?? 50),
  );

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs text-slate-500">
        {total >= 0 ? (
          <>
            Showing{" "}
            <span className="font-medium text-slate-900">
              {startIdx.toLocaleString()}–{Number.isFinite(endIdx) ? endIdx.toLocaleString() : "?"}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900">
              {total.toLocaleString()}
            </span>{" "}
            leads
          </>
        ) : (
          <>Page {page}</>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => goto(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </Button>
        <span className="text-xs text-slate-600">
          Page{" "}
          <span className="font-medium text-slate-900">{page}</span>
          {totalPages > 0 && (
            <>
              {" "}of <span className="font-medium text-slate-900">{totalPages.toLocaleString()}</span>
            </>
          )}
        </span>
        <Button
          variant="outline"
          onClick={() => goto(page + 1)}
          disabled={totalPages > 0 && page >= totalPages}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <form
          className="ml-2 flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(jump);
            if (!Number.isNaN(n) && n > 0) goto(n);
          }}
        >
          <span className="text-xs text-slate-500">Jump</span>
          <Input
            type="number"
            min={1}
            max={totalPages > 0 ? totalPages : undefined}
            value={jump}
            onChange={(e) => setJump(e.target.value)}
            className="h-8 w-16 bg-white"
          />
        </form>
      </div>
    </div>
  );
}
