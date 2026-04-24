"use client";

import { useSearchParams } from "next/navigation";
import { CloudLightning, Sparkles } from "lucide-react";
import { KpiCards } from "@/components/kpi-cards";
import { FilterBar, filtersFromUrl } from "@/components/filter-bar";
import { LeadsTable } from "@/components/leads-table";

/**
 * Full hail-leads dashboard. Rendered inside HailLeadsGate, so by the time
 * this component mounts the demo password has already been accepted.
 */
export function HailLeadsDashboard() {
  const sp = useSearchParams();
  const filters = filtersFromUrl(sp);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
            <CloudLightning className="h-3.5 w-3.5" />
            Live demo
          </span>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Hail Leads{" "}
            <span className="text-slate-400">·</span>{" "}
            <span className="text-indigo-600">Storm × Permit matches</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Every row below is an address where NOAA reported hail{" "}
            <span className="font-medium text-slate-900">and</span> a roof /
            siding / gutter / solar permit was pulled within 180 days after the
            storm.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Refreshed overnight from 180+ Texas jurisdictions
        </div>
      </header>

      {/* KPIs */}
      <section className="mb-8">
        <KpiCards />
      </section>

      {/* Filters */}
      <FilterBar initial={filters} />

      {/* Table */}
      <LeadsTable filters={filters} />
    </div>
  );
}
