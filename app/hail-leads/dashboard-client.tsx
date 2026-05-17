"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CloudLightning, Sparkles } from "lucide-react";
import { AsOfPill, KpiCards } from "@/components/kpi-cards";
import { CacheBanner, type CacheBannerState } from "@/components/cache-banner";
import { FilterBar, filtersFromUrl } from "@/components/filter-bar";
import { LeadsTable } from "@/components/leads-table";
import { getHailLeadsStatsCached } from "@/lib/api";

/**
 * Full hail-leads dashboard. Rendered inside HailLeadsGate, so by the time
 * this component mounts the demo password has already been accepted.
 *
 * Default render reads from the R730 static JSON cache (Tailscale Funnel,
 * refreshed hourly). The live Railway API is only consulted once the user
 * applies a filter; if that fails we fall back to the cache and flip the
 * banner to its warning state.
 */
export function HailLeadsDashboard() {
  const sp = useSearchParams();
  const filters = filtersFromUrl(sp);

  const [bannerState, setBannerState] = useState<CacheBannerState>("info");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  // Pull stats once at mount so the "as of" pill in the header has a
  // generated_at to display alongside the KPI cards (which fetch the
  // same URL — the browser HTTP cache de-dupes).
  useEffect(() => {
    let cancelled = false;
    getHailLeadsStatsCached()
      .then((data) => {
        if (!cancelled && data.generated_at) {
          setGeneratedAt(data.generated_at);
        }
      })
      .catch(() => {
        /* silent — banner stays in info state, pill stays empty */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSourceChange = useCallback(
    ({
      source,
      generatedAt: leadsGeneratedAt,
    }: {
      source: "cache" | "live" | "cache-after-error";
      generatedAt?: string | null;
    }) => {
      if (source === "live") {
        setBannerState("hidden");
        return;
      }
      if (source === "cache-after-error") {
        setBannerState("warning");
      } else {
        setBannerState("info");
      }
      // Prefer the leads-snapshot generated_at if we have one — it's the
      // payload the user is actually looking at.
      if (leadsGeneratedAt) setGeneratedAt(leadsGeneratedAt);
    },
    [],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="brand-pill">
              <CloudLightning className="h-3.5 w-3.5" />
              Live demo
            </span>
            <AsOfPill generatedAt={generatedAt} />
          </div>
          <h1 className="brand-heading mt-3 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Hail Leads{" "}
            <span className="brand-faint">·</span>{" "}
            <span className="brand-text">Storm × Permit matches</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm brand-muted">
            Every row below is an address where NOAA reported hail{" "}
            <span className="font-medium text-sky-200">and</span> a roof /
            siding / gutter / solar permit was pulled within 180 days after the
            storm.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs brand-muted">
          <Sparkles className="h-3.5 w-3.5 text-sky-300" />
          Refreshed overnight from 180+ Texas jurisdictions
        </div>
      </header>

      {/* Cache state banner */}
      <CacheBanner state={bannerState} generatedAt={generatedAt} />

      {/* KPIs */}
      <section className="mb-8">
        <KpiCards />
      </section>

      {/* Filters */}
      <FilterBar initial={filters} />

      {/* Table */}
      <LeadsTable filters={filters} onSourceChange={handleSourceChange} />
    </div>
  );
}
