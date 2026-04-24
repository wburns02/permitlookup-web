"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Download,
  Filter as FilterIcon,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { downloadHailLeadsCsv } from "@/lib/api";
import type { HailLeadsFilters, LeadCategory, SortKey } from "@/lib/types";

const COUNTIES = [
  { value: "", label: "All counties" },
  { value: "Tarrant", label: "Tarrant" },
  { value: "Travis", label: "Travis" },
  { value: "Williamson", label: "Williamson" },
  { value: "Hays", label: "Hays" },
  { value: "Bastrop", label: "Bastrop" },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "roof_replace", label: "Roof replace" },
  { value: "siding", label: "Siding" },
  { value: "gutter", label: "Gutter" },
  { value: "solar", label: "Solar" },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "score_desc", label: "Score (best first)" },
  { value: "storm_date_desc", label: "Most recent storm" },
  { value: "issue_date_desc", label: "Most recent permit" },
];

/**
 * Convert URLSearchParams from next/navigation into typed filters for the API.
 */
export function filtersFromUrl(
  sp: URLSearchParams | ReadonlyURLSearchParams,
): HailLeadsFilters {
  const out: HailLeadsFilters = {};
  const get = (k: string) => sp.get(k) ?? undefined;

  const county = get("county");
  if (county) out.county = county;
  const from_date = get("from_date");
  if (from_date) out.from_date = from_date;
  const to_date = get("to_date");
  if (to_date) out.to_date = to_date;
  const category = get("category") as LeadCategory | undefined;
  if (category) out.category = category;
  const minH = get("min_hail_inches");
  if (minH && !Number.isNaN(Number(minH))) out.min_hail_inches = Number(minH);
  const minD = get("min_days_after");
  if (minD && !Number.isNaN(Number(minD))) out.min_days_after = Number(minD);
  const maxD = get("max_days_after");
  if (maxD && !Number.isNaN(Number(maxD))) out.max_days_after = Number(maxD);
  const page = get("page");
  if (page && !Number.isNaN(Number(page))) out.page = Number(page);
  const sort = get("sort") as SortKey | undefined;
  if (sort) out.sort = sort;

  return out;
}

type ReadonlyURLSearchParams = ReturnType<typeof useSearchParams>;

function defaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 365);
  return d.toISOString().slice(0, 10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  initial: HailLeadsFilters;
};

export function FilterBar({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [county, setCounty] = useState(initial.county ?? "");
  const [fromDate, setFromDate] = useState(
    initial.from_date ?? defaultFromDate(),
  );
  const [toDate, setToDate] = useState(initial.to_date ?? todayDate());
  const [category, setCategory] = useState<string>(initial.category ?? "");
  const [minHail, setMinHail] = useState<string>(
    initial.min_hail_inches != null ? String(initial.min_hail_inches) : "",
  );
  const [sort, setSort] = useState<SortKey>(initial.sort ?? "score_desc");

  function currentFilters(): HailLeadsFilters {
    const f: HailLeadsFilters = {};
    if (county) f.county = county;
    if (fromDate) f.from_date = fromDate;
    if (toDate) f.to_date = toDate;
    if (category) f.category = category as LeadCategory;
    if (minHail && !Number.isNaN(Number(minHail)))
      f.min_hail_inches = Number(minHail);
    if (sort) f.sort = sort;
    return f;
  }

  function applyFilters() {
    const params = new URLSearchParams();
    const f = currentFilters();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== "") params.set(k, String(v));
    });
    params.set("page", "1"); // reset to page 1 on filter change
    startTransition(() => {
      router.push(`/hail-leads?${params.toString()}`, { scroll: false });
    });
  }

  function clearFilters() {
    setCounty("");
    setFromDate(defaultFromDate());
    setToDate(todayDate());
    setCategory("");
    setMinHail("");
    setSort("score_desc");
    startTransition(() => {
      router.push(`/hail-leads`, { scroll: false });
    });
  }

  async function exportCsv() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadHailLeadsCsv(currentFilters());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="sticky top-[68px] z-20 mb-6 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <FilterIcon className="h-3.5 w-3.5" />
        Filters
      </div>

      <div className="grid gap-3 md:grid-cols-6">
        {/* County */}
        <div className="md:col-span-1">
          <Label>County</Label>
          <Select
            items={COUNTIES}
            value={county}
            onValueChange={(v) => setCounty(typeof v === "string" ? v : "")}
          >
            <SelectTrigger className="mt-1 h-9 w-full bg-white">
              <SelectValue placeholder="All counties" />
            </SelectTrigger>
            <SelectContent>
              {COUNTIES.map((c) => (
                <SelectItem key={c.value || "__all"} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From */}
        <div className="md:col-span-1">
          <Label>From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 h-9 bg-white"
          />
        </div>

        {/* To */}
        <div className="md:col-span-1">
          <Label>To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 h-9 bg-white"
          />
        </div>

        {/* Category */}
        <div className="md:col-span-1">
          <Label>Category</Label>
          <Select
            items={CATEGORIES}
            value={category}
            onValueChange={(v) => setCategory(typeof v === "string" ? v : "")}
          >
            <SelectTrigger className="mt-1 h-9 w-full bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value || "__all"} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min hail */}
        <div className="md:col-span-1">
          <Label>Min hail</Label>
          <div className="relative mt-1">
            <Input
              type="number"
              step={0.25}
              min={0}
              value={minHail}
              onChange={(e) => setMinHail(e.target.value)}
              placeholder="0"
              className="h-9 bg-white pr-12"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
              in
            </span>
          </div>
        </div>

        {/* Sort */}
        <div className="md:col-span-1">
          <Label>Sort</Label>
          <Select
            items={SORTS}
            value={sort}
            onValueChange={(v) => {
              if (typeof v === "string") setSort(v as SortKey);
            }}
          >
            <SelectTrigger className="mt-1 h-9 w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={applyFilters}
            disabled={isPending}
            className={cn(
              "bg-indigo-600 text-white hover:bg-indigo-500",
              isPending && "opacity-80",
            )}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isPending ? "Applying…" : "Apply filters"}
          </Button>
          <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {exportError && (
            <span className="text-xs text-red-600">{exportError}</span>
          )}
          <Button variant="outline" onClick={exportCsv} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {exporting ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-600">
      {children}
    </label>
  );
}
