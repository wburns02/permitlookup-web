"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { CacheBanner } from "@/components/cache-banner";
import { DumpsterAsOfPill, DumpsterKpiCards } from "@/components/dumpster/kpi-cards";
import {
  DumpsterFilterBar,
  defaultDumpsterFilters,
} from "@/components/dumpster/filter-bar";
import { DumpsterLeadsTable } from "@/components/dumpster/leads-table";
import { DumpsterLeadDrawer } from "@/components/dumpster/lead-detail-drawer";
import {
  getCachedDumpsterLeads,
  getCachedDumpsterStats,
  type CachedDumpsterStats,
} from "@/lib/dumpster-cache";
import type { DumpsterFilters, DumpsterLead } from "@/lib/dumpster-types";

/**
 * Dumpster-leads dashboard. Reads the R730 hourly JSON cache (proxied via
 * the same-origin Vercel route handler at `/api/dashboard-cache`) and never
 * calls the live Railway API — there is no live API for dumpster yet.
 *
 * All filtering happens client-side over the cached 50 rows. CSV export
 * dumps the currently visible rows.
 */
export function DumpsterLeadsDashboard() {
  const [stats, setStats] = useState<CachedDumpsterStats | null>(null);
  const [leads, setLeads] = useState<DumpsterLead[] | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [filters, setFilters] = useState<DumpsterFilters>(
    defaultDumpsterFilters(),
  );
  const [selected, setSelected] = useState<DumpsterLead | null>(null);

  // Fetch cache on mount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getCachedDumpsterStats(), getCachedDumpsterLeads()])
      .then(([s, l]) => {
        if (cancelled) return;
        setStats(s);
        setLeads(l.results);
        // Prefer the leads-snapshot generated_at for the banner since that's
        // what the user is actually looking at.
        setGeneratedAt(l.generated_at ?? s.generated_at ?? null);
      })
      .catch(() => {
        /* getCachedDumpster* return fallbacks on failure — never throws */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Apply filters client-side.
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    return applyFilters(leads, filters);
  }, [leads, filters]);

  const exportCsv = useCallback(() => {
    const rows = filteredLeads;
    const headers = [
      "lead_id",
      "lead_grade",
      "lead_score",
      "address",
      "city",
      "zip",
      "county",
      "category",
      "description",
      "issue_date",
      "applied_date",
      "effective_date",
      "days_since_issue",
      "contractor_company",
      "contractor_phone",
      "owner_name",
      "permit_type",
      "work_class",
      "valuation",
      "source",
    ];
    const lines: string[] = [headers.join(",")];
    for (const r of rows) {
      const cells = headers.map((h) => csvCell((r as Record<string, unknown>)[h]));
      lines.push(cells.join(","));
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dumpster-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filteredLeads]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
              <MapPin className="h-3.5 w-3.5" />
              Live demo · Baton Rouge
            </span>
            <DumpsterAsOfPill generatedAt={generatedAt} />
          </div>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Dumpster Leads{" "}
            <span className="text-slate-400">·</span>{" "}
            <span className="text-indigo-600">Baton Rouge</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Construction projects in your service area that probably need a
            roll-off. Refreshed overnight from East Baton Rouge permit data.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Hourly snapshot from MGO permit data
        </div>
      </header>

      {/* Cache state banner — always "info" for dumpster (no live API yet) */}
      <CacheBanner state="info" generatedAt={generatedAt} />

      {/* KPIs */}
      <section className="mb-8">
        {stats === null || leads === null ? (
          <DumpsterKpiCards status="loading" />
        ) : (
          <DumpsterKpiCards status="ok" stats={stats} leads={leads} />
        )}
      </section>

      {/* Filters */}
      <DumpsterFilterBar
        initial={filters}
        onApply={setFilters}
        onExportCsv={exportCsv}
      />

      {/* Table */}
      <DumpsterLeadsTable
        leads={filteredLeads}
        loading={leads === null}
        onSelect={setSelected}
      />

      {/* Drawer */}
      <DumpsterLeadDrawer
        lead={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter logic (client-side)
// ---------------------------------------------------------------------------

function applyFilters(
  leads: DumpsterLead[],
  f: DumpsterFilters,
): DumpsterLead[] {
  const cityZipNeedle = (f.cityZip ?? "").trim().toLowerCase();
  const categories = new Set(f.categories ?? []);
  const fromMs = f.fromDate ? Date.parse(f.fromDate + "T00:00:00Z") : NaN;
  const toMs = f.toDate ? Date.parse(f.toDate + "T23:59:59Z") : NaN;
  const minDays = f.minDaysSinceIssue ?? 0;

  let out = leads.filter((l) => {
    if (cityZipNeedle) {
      const hay = `${l.city ?? ""} ${l.zip ?? ""} ${l.county ?? ""} ${l.address ?? ""}`.toLowerCase();
      if (!hay.includes(cityZipNeedle)) return false;
    }
    if (categories.size > 0 && !categories.has(l.category)) return false;
    const dateIso = l.effective_date ?? l.issue_date ?? l.applied_date;
    if (dateIso) {
      const t = Date.parse(dateIso + "T00:00:00Z");
      if (!Number.isNaN(fromMs) && t < fromMs) return false;
      if (!Number.isNaN(toMs) && t > toMs) return false;
    }
    if (minDays > 0) {
      if (l.days_since_issue == null || l.days_since_issue < minDays)
        return false;
    }
    return true;
  });

  out = out.slice().sort((a, b) => {
    if (f.sort === "grade") {
      // Grade A first, missing/null last. Tiebreak by score desc.
      const ag = a.lead_score ?? -1;
      const bg = b.lead_score ?? -1;
      if (ag !== bg) return bg - ag;
      const aIso = a.effective_date ?? a.issue_date ?? a.applied_date;
      const bIso = b.effective_date ?? b.issue_date ?? b.applied_date;
      const at = aIso ? Date.parse(aIso) : 0;
      const bt = bIso ? Date.parse(bIso) : 0;
      return bt - at;
    }
    const aIso = a.effective_date ?? a.issue_date ?? a.applied_date;
    const bIso = b.effective_date ?? b.issue_date ?? b.applied_date;
    const at = aIso ? Date.parse(aIso) : 0;
    const bt = bIso ? Date.parse(bIso) : 0;
    return f.sort === "oldest" ? at - bt : bt - at;
  });

  return out;
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
