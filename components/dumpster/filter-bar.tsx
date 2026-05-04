"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Download,
  Filter as FilterIcon,
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
import type { DumpsterFilters, DumpsterSortKey } from "@/lib/dumpster-types";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "reroof", label: "Reroof" },
  { value: "roof_other", label: "Roof other" },
  { value: "demolition", label: "Demolition" },
  { value: "new_construction", label: "New construction" },
  { value: "addition", label: "Addition" },
  { value: "remodel", label: "Remodel" },
  { value: "pool", label: "Pool" },
  { value: "other", label: "Other" },
];

const SORTS: { value: DumpsterSortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function defaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 14);
  return d.toISOString().slice(0, 10);
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultDumpsterFilters(): DumpsterFilters {
  return {
    cityZip: "",
    categories: [],
    fromDate: defaultFromDate(),
    toDate: todayDate(),
    minDaysSinceIssue: 0,
    sort: "newest",
  };
}

type Props = {
  initial: DumpsterFilters;
  onApply: (next: DumpsterFilters) => void;
  onExportCsv: () => void;
};

export function DumpsterFilterBar({ initial, onApply, onExportCsv }: Props) {
  const [cityZip, setCityZip] = useState(initial.cityZip ?? "");
  const [categories, setCategories] = useState<string[]>(
    initial.categories ?? [],
  );
  const [fromDate, setFromDate] = useState(
    initial.fromDate ?? defaultFromDate(),
  );
  const [toDate, setToDate] = useState(initial.toDate ?? todayDate());
  const [minDays, setMinDays] = useState<string>(
    initial.minDaysSinceIssue != null ? String(initial.minDaysSinceIssue) : "0",
  );
  const [sort, setSort] = useState<DumpsterSortKey>(initial.sort ?? "newest");
  const [mobileOpen, setMobileOpen] = useState(false);

  const categoryLabel = useMemo(() => {
    if (categories.length === 0) return "All categories";
    if (categories.length === 1) {
      return (
        CATEGORY_OPTIONS.find((c) => c.value === categories[0])?.label ??
        categories[0]
      );
    }
    return `${categories.length} categories`;
  }, [categories]);

  function buildFilters(): DumpsterFilters {
    return {
      cityZip: cityZip.trim() || undefined,
      categories: categories.length > 0 ? [...categories] : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      minDaysSinceIssue:
        minDays && !Number.isNaN(Number(minDays)) ? Number(minDays) : undefined,
      sort,
    };
  }

  function applyFilters() {
    onApply(buildFilters());
  }

  function clearFilters() {
    const reset = defaultDumpsterFilters();
    setCityZip(reset.cityZip ?? "");
    setCategories(reset.categories ?? []);
    setFromDate(reset.fromDate ?? defaultFromDate());
    setToDate(reset.toDate ?? todayDate());
    setMinDays(String(reset.minDaysSinceIssue ?? 0));
    setSort(reset.sort ?? "newest");
    onApply(reset);
  }

  function toggleCategory(value: string) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  return (
    <div className="sticky top-[68px] z-20 mb-6 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm backdrop-blur">
      {/* Mobile collapse toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 md:hidden"
        aria-expanded={mobileOpen}
      >
        <span className="inline-flex items-center gap-2">
          <FilterIcon className="h-3.5 w-3.5" />
          Filters
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            mobileOpen && "rotate-180",
          )}
        />
      </button>

      <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 md:mb-3 md:flex">
        <FilterIcon className="h-3.5 w-3.5" />
        Filters
      </div>

      <div
        className={cn(
          "grid gap-3 md:grid-cols-6",
          !mobileOpen && "hidden md:grid",
          mobileOpen && "mt-3",
        )}
      >
        {/* City/Zip */}
        <div className="md:col-span-2">
          <Label>City or zip</Label>
          <Input
            type="text"
            value={cityZip}
            onChange={(e) => setCityZip(e.target.value)}
            placeholder="Baton Rouge, 70808…"
            className="mt-1 h-9 bg-white"
          />
        </div>

        {/* Category multi-select via custom popover */}
        <div className="md:col-span-1">
          <Label>Category</Label>
          <CategoryMultiSelect
            label={categoryLabel}
            options={CATEGORY_OPTIONS}
            selected={categories}
            onToggle={toggleCategory}
          />
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

        {/* Sort */}
        <div className="md:col-span-1">
          <Label>Sort</Label>
          <Select
            items={SORTS}
            value={sort}
            onValueChange={(v) => {
              if (typeof v === "string") setSort(v as DumpsterSortKey);
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

        {/* Min days */}
        <div className="md:col-span-1">
          <Label>Min days since issue</Label>
          <Input
            type="number"
            min={0}
            value={minDays}
            onChange={(e) => setMinDays(e.target.value)}
            placeholder="0"
            className="mt-1 h-9 bg-white"
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center justify-between gap-3",
          !mobileOpen && "hidden md:flex",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={applyFilters}
            className="bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Apply filters
          </Button>
          <Button variant="ghost" onClick={clearFilters}>
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onExportCsv}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
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

function CategoryMultiSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Click-outside handler.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dumpster-multi]")) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative mt-1" data-dumpster-multi>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
        )}
      >
        <span
          className={cn(
            "truncate",
            selected.length === 0 && "text-slate-400",
          )}
        >
          {label}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          {options.map((opt) => {
            const isOn = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isOn}
                onClick={() => onToggle(opt.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-slate-800 transition hover:bg-slate-100",
                  isOn && "bg-indigo-50 text-indigo-700",
                )}
              >
                <span>{opt.label}</span>
                {isOn && <Check className="h-3.5 w-3.5 text-indigo-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
