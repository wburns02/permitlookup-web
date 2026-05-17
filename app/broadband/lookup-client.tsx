"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CircleDot,
  Loader2,
  MapPin,
  Search,
  Wifi,
} from "lucide-react";

type Provider = {
  provider_id: number;
  brand_name: string | null;
  holding_company_name: string | null;
  technology: string;
  technology_code: number;
  max_download_mbps: number | null;
  max_upload_mbps: number | null;
  low_latency: boolean | null;
  business_residential: string | null;
};

type LookupResponse = {
  address: string | null;
  city: string | null;
  state: string;
  zip: string | null;
  block_geoid: string | null;
  tract_geoid: string | null;
  lat: number | null;
  lon: number | null;
  providers: Provider[];
  max_download_mbps: number | null;
  max_upload_mbps: number | null;
  has_fiber: boolean;
  has_cable: boolean;
  only_satellite: boolean;
  isp_count: number;
  fiber_isp_count: number;
  cable_isp_count: number;
  satellite_isp_count: number;
  wireless_isp_count: number;
  source: string;
  match_method: string;
};

type ErrorPayload = { error?: string; message?: string; detail?: string };

// The FCC BDC technology strings come through verbatim (fiber, cable, coax,
// copper, dsl, licensed-fixed-wireless, unlicensed-fixed-wireless,
// licensed-unlicensed-fixed-wireless, satellite, gso-satellite, ngso-satellite,
// etc). We bucket them into 5 display chips by substring match.
function techChip(tech: string): { label: string; className: string } {
  const t = tech.toLowerCase();
  if (t.includes("fiber"))
    return { label: "Fiber", className: "bg-emerald-100 text-emerald-800" };
  if (t.includes("cable") || t.includes("coax") || t.includes("docsis"))
    return { label: "Cable", className: "bg-indigo-100 text-indigo-800" };
  if (t.includes("satellite"))
    return { label: "Satellite", className: "bg-slate-200 text-slate-700" };
  if (t.includes("wireless"))
    return { label: "Fixed Wireless", className: "bg-sky-100 text-sky-800" };
  if (t.includes("copper") || t.includes("dsl"))
    return { label: "Copper / DSL", className: "bg-amber-100 text-amber-800" };
  return { label: tech, className: "bg-slate-100 text-slate-700" };
}

function brCode(code: string | null | undefined) {
  if (!code) return null;
  const tokens = code.split(/[/,\s]+/).filter(Boolean);
  const hasR = tokens.some((t) => t.toUpperCase() === "R");
  const hasB = tokens.some((t) => t.toUpperCase() === "B");
  const hasX = tokens.some((t) => t.toUpperCase() === "X");
  if (hasX || (hasR && hasB)) return "Residential + Business";
  if (hasR) return "Residential";
  if (hasB) return "Business";
  return code;
}

export function BroadbandLookup() {
  // Default prefill is verified to return live FCC BDC providers (13 ISPs,
  // 5000 Mbps fiber). The White House address resolves to no providers in
  // FCC BDC, which makes a weaker first impression.
  const [address, setAddress] = useState("FM 1696");
  const [city, setCity] = useState("Huntsville");
  const [state, setState] = useState("TX");
  const [zip, setZip] = useState("77340");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("address", address.trim());
      if (city.trim()) params.set("city", city.trim());
      params.set("state", state.trim().toUpperCase());
      if (zip.trim()) params.set("zip", zip.trim());

      const res = await fetch(`/api/broadband/lookup?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      let body: LookupResponse | ErrorPayload | null = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = null;
      }
      if (!res.ok) {
        const err =
          (body as ErrorPayload | null)?.message ||
          (body as ErrorPayload | null)?.detail ||
          (body as ErrorPayload | null)?.error ||
          `Request failed (${res.status})`;
        setError(err);
        return;
      }
      if (!body) {
        setError("Empty response from upstream.");
        return;
      }
      setResult(body as LookupResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 border-b border-slate-200 p-6 md:grid-cols-12"
      >
        <div className="md:col-span-5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Street address
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="1600 Pennsylvania Avenue"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Washington"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            State
          </label>
          <input
            type="text"
            required
            maxLength={2}
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            placeholder="DC"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm uppercase text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
            ZIP
          </label>
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="20500"
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div className="md:col-span-12">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking up&hellip;
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Look up broadband
              </>
            )}
          </button>
        </div>
      </form>

      <div className="p-6 md:p-8">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <div className="font-medium">Lookup failed</div>
              <div className="mt-0.5 text-amber-800">{error}</div>
            </div>
          </div>
        )}

        {!error && !result && !loading && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Submit the form to fetch live FCC broadband coverage.
          </div>
        )}

        {result && <ResultPanel data={result} />}
      </div>
    </div>
  );
}

function ResultPanel({ data }: { data: LookupResponse }) {
  const hasProviders = data.providers && data.providers.length > 0;

  return (
    <div>
      {/* SUMMARY */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="font-mono text-slate-900">
            {[data.address, data.city, data.state, data.zip]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-400">
          source: {data.source} &middot; {data.match_method.replace(/_/g, " ")}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Stat label="ISPs at address" value={data.isp_count.toString()} />
        <Stat
          label="Max download"
          value={
            data.max_download_mbps != null
              ? `${data.max_download_mbps.toLocaleString()} Mbps`
              : "—"
          }
        />
        <Stat
          label="Max upload"
          value={
            data.max_upload_mbps != null
              ? `${data.max_upload_mbps.toLocaleString()} Mbps`
              : "—"
          }
        />
        <Stat
          label="Fiber available"
          value={data.has_fiber ? "Yes" : "No"}
          tone={data.has_fiber ? "good" : "muted"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {data.has_fiber && (
          <Pill className="bg-emerald-100 text-emerald-800">Fiber</Pill>
        )}
        {data.has_cable && (
          <Pill className="bg-indigo-100 text-indigo-800">Cable</Pill>
        )}
        {data.only_satellite && (
          <Pill className="bg-amber-100 text-amber-800">Satellite only</Pill>
        )}
        {data.fiber_isp_count > 0 && (
          <Pill className="bg-slate-100 text-slate-700">
            {data.fiber_isp_count} fiber ISP{data.fiber_isp_count === 1 ? "" : "s"}
          </Pill>
        )}
        {data.cable_isp_count > 0 && (
          <Pill className="bg-slate-100 text-slate-700">
            {data.cable_isp_count} cable ISP{data.cable_isp_count === 1 ? "" : "s"}
          </Pill>
        )}
        {data.wireless_isp_count > 0 && (
          <Pill className="bg-slate-100 text-slate-700">
            {data.wireless_isp_count} fixed-wireless
          </Pill>
        )}
        {data.satellite_isp_count > 0 && (
          <Pill className="bg-slate-100 text-slate-700">
            {data.satellite_isp_count} satellite
          </Pill>
        )}
      </div>

      {/* PROVIDERS */}
      <div className="mt-8">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Providers serving this address
          </h3>
          <span className="text-xs text-slate-500">
            {hasProviders
              ? `${data.providers.length} returned`
              : "0 found at this resolution"}
          </span>
        </div>

        {!hasProviders ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            <p>
              No ISPs resolved at this address. The lookup found a{" "}
              <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">
                {data.match_method.replace(/_/g, " ")}
              </code>{" "}
              match against the FCC BDC{" "}
              {data.tract_geoid ? (
                <>
                  tract{" "}
                  <code className="rounded bg-white px-1 py-0.5 font-mono text-xs">
                    {data.tract_geoid}
                  </code>
                </>
              ) : (
                "data"
              )}{" "}
              but no providers were associated with the matched record.
            </p>
            <p className="mt-3">
              Try a different street address — coverage data varies block by
              block, and the FCC publishes at the location level.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {data.providers.map((p) => {
              const chip = techChip(p.technology);
              return (
                <li
                  key={`${p.provider_id}-${p.technology_code}`}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Wifi className="h-4 w-4 text-emerald-600" />
                        {p.brand_name ?? "Unknown ISP"}
                      </div>
                      {p.holding_company_name &&
                        p.holding_company_name !== p.brand_name && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            {p.holding_company_name}
                          </div>
                        )}
                    </div>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide " +
                        chip.className
                      }
                    >
                      {chip.label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <ArrowDown className="h-3.5 w-3.5 text-slate-400" />
                      {p.max_download_mbps != null
                        ? `${p.max_download_mbps.toLocaleString()} Mbps`
                        : "—"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ArrowUp className="h-3.5 w-3.5 text-slate-400" />
                      {p.max_upload_mbps != null
                        ? `${p.max_upload_mbps.toLocaleString()} Mbps`
                        : "—"}
                    </div>
                    {p.low_latency && (
                      <div className="col-span-2 flex items-center gap-1.5 text-emerald-700">
                        <CircleDot className="h-3.5 w-3.5" />
                        Low-latency
                      </div>
                    )}
                    {brCode(p.business_residential) && (
                      <div className="col-span-2 text-slate-500">
                        {brCode(p.business_residential)}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "good" | "muted";
}) {
  const valueColor =
    tone === "good"
      ? "text-emerald-600"
      : tone === "muted"
        ? "text-slate-400"
        : "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`mt-1 text-xl font-semibold tracking-tight ${valueColor}`}>
        {value}
      </div>
    </div>
  );
}

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
        (className ?? "")
      }
    >
      {children}
    </span>
  );
}
