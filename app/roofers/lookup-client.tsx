"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calendar,
  CloudHail,
  ExternalLink,
  Home,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

type RooferLeadComponents = {
  storm_severity: number;
  home_age_score: number;
  mortgage_score: number;
  roof_permit_recency_penalty: number;
  distance_miles: number | null;
};

type RooferLeadItem = {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  county: string | null;
  lat: number | null;
  lon: number | null;
  year_built: number | null;
  has_active_mortgage: boolean;
  recent_roof_permit_date: string | null;
  storm_event_id: number;
  storm_date: string | null;
  days_after_storm: number | null;
  storm_magnitude: number | null;
  composite_score: number;
  components: RooferLeadComponents;
};

type RecentResponse = {
  state: string;
  days_back: number;
  min_score: number;
  event_count: number;
  count: number;
  leads: RooferLeadItem[];
};

type ErrorPayload = { error?: string; message?: string; detail?: string };

const US_STATES = [
  "TX",
  "FL",
  "GA",
  "NC",
  "SC",
  "OK",
  "KS",
  "MO",
  "AR",
  "LA",
  "TN",
  "AL",
  "MS",
];

function scoreBadgeClass(score: number): string {
  if (score >= 90) return "bg-orange-500/20 text-orange-200 border-orange-400/40";
  if (score >= 70) return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-stone-700/40 text-stone-300 border-stone-600/40";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Hot";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Warm";
  return "Cold";
}

function formatAddress(lead: RooferLeadItem): string {
  return (
    [lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(", ") ||
    `Unknown address (lat ${lead.lat?.toFixed(3) ?? "?"}, lon ${lead.lon?.toFixed(3) ?? "?"})`
  );
}

function googleMapsUrl(lead: RooferLeadItem): string {
  if (lead.lat != null && lead.lon != null) {
    return `https://www.google.com/maps?q=${lead.lat},${lead.lon}`;
  }
  const q = encodeURIComponent(formatAddress(lead));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function StormStrikeLookup() {
  const [state, setState] = useState("TX");
  const [daysBack, setDaysBack] = useState(14);
  const [minScore, setMinScore] = useState(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecentResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("state", state.trim().toUpperCase());
      params.set("days_back", String(daysBack));
      params.set("min_score", String(minScore));
      params.set("limit", "20");

      const res = await fetch(`/api/roofers/recent?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      const text = await res.text();
      let body: RecentResponse | ErrorPayload | null = null;
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
      setResult(body as RecentResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-orange-500/15 bg-[#14100d] shadow-[0_0_40px_-16px_rgba(249,115,22,0.4)]">
      <form
        onSubmit={onSubmit}
        className="grid gap-6 border-b border-orange-500/15 p-6 md:grid-cols-12 md:items-end"
      >
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-stone-700 bg-[#0b0604] px-3 py-2.5 text-sm text-stone-100 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <div className="flex items-baseline justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              Days back
            </label>
            <span className="font-mono text-xs text-stone-300">
              {daysBack}d
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="mt-3 block w-full accent-orange-500"
          />
        </div>
        <div className="md:col-span-3">
          <div className="flex items-baseline justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400">
              Min score
            </label>
            <span className="font-mono text-xs text-stone-300">{minScore}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="mt-3 block w-full accent-orange-500"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-stone-950 shadow-[0_0_24px_-8px_rgba(249,115,22,0.7)] transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning&hellip;
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find leads
              </>
            )}
          </button>
        </div>
      </form>

      <div className="p-6 md:p-8">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <div className="font-medium">Storm scan failed</div>
              <div className="mt-0.5 text-amber-200">{error}</div>
              <div className="mt-2 text-xs text-amber-200/70">
                The recent-leads endpoint joins NOAA storm events, parcel
                geometry, and 35M mortgage records. Slow queries can time
                out. Try a smaller days-back window.
              </div>
            </div>
          </div>
        )}

        {!error && !result && !loading && (
          <div className="rounded-lg border border-dashed border-stone-700 bg-[#0b0604] p-8 text-center text-sm text-stone-400">
            Pick a state, dial in your window, and we&apos;ll surface the
            highest-scoring rooftops from recent hail strikes.
          </div>
        )}

        {result && <ResultPanel data={result} />}
      </div>
    </div>
  );
}

function ResultPanel({ data }: { data: RecentResponse }) {
  const hasLeads = data.leads && data.leads.length > 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-b border-orange-500/15 pb-5">
        <div className="flex items-center gap-2 text-sm text-stone-400">
          <CloudHail className="h-4 w-4 text-orange-400" />
          <span className="font-mono text-stone-100">
            {data.state} &middot; last {data.days_back} day
            {data.days_back === 1 ? "" : "s"} &middot; score &ge;{" "}
            {data.min_score}
          </span>
        </div>
        <div className="text-xs uppercase tracking-wider text-stone-500">
          {data.event_count} storm event{data.event_count === 1 ? "" : "s"}{" "}
          &middot; {data.count} ranked propert
          {data.count === 1 ? "y" : "ies"}
        </div>
      </div>

      {!hasLeads ? (
        <div className="mt-6 rounded-lg border border-dashed border-stone-700 bg-[#0b0604] p-8 text-sm text-stone-300">
          <p className="font-medium text-stone-100">
            No qualifying storms in this window.
          </p>
          <p className="mt-2">
            {data.event_count === 0 ? (
              <>
                NOAA logged zero hail events in {data.state} over the last{" "}
                {data.days_back} day{data.days_back === 1 ? "" : "s"}. Try a
                wider days-back range, or check a state with active severe
                weather.
              </>
            ) : (
              <>
                {data.event_count} storm event
                {data.event_count === 1 ? "" : "s"} found, but no parcels scored
                above {data.min_score}. Try lowering the minimum score.
              </>
            )}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {data.leads.map((lead, idx) => (
            <LeadCard key={`${lead.storm_event_id}-${idx}`} lead={lead} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: RooferLeadItem }) {
  const distance = lead.components.distance_miles;
  const mag = lead.storm_magnitude;
  const days = lead.days_after_storm;
  const score = Math.round(lead.composite_score);

  return (
    <li className="flex flex-col rounded-xl border border-orange-500/15 bg-[#14100d] p-5 shadow-sm transition hover:border-orange-400/40 hover:shadow-[0_0_24px_-8px_rgba(249,115,22,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
            <Home className="h-4 w-4 shrink-0 text-orange-400" />
            <span className="truncate">{formatAddress(lead)}</span>
          </div>
          {lead.county && (
            <div className="mt-1 text-xs text-stone-400">
              {lead.county} County
            </div>
          )}
        </div>
        <div
          className={
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold " +
            scoreBadgeClass(score)
          }
          title={`Composite score: ${score}/100`}
        >
          <Sparkles className="h-3 w-3" />
          {score} &middot; {scoreLabel(score)}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {mag != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-700/40 px-2.5 py-1 font-medium text-stone-200">
            <CloudHail className="h-3 w-3 text-stone-400" />
            {mag.toFixed(2)}&Prime; hail
          </span>
        )}
        {distance != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-700/40 px-2.5 py-1 font-medium text-stone-200">
            <Target className="h-3 w-3 text-stone-400" />
            {distance.toFixed(1)} mi from centroid
          </span>
        )}
        {days != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-700/40 px-2.5 py-1 font-medium text-stone-200">
            <Calendar className="h-3 w-3 text-stone-400" />
            {days}d ago
          </span>
        )}
        {lead.year_built != null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-700/40 px-2.5 py-1 font-medium text-stone-200">
            built {lead.year_built}
          </span>
        )}
        {lead.has_active_mortgage && (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 font-medium text-orange-200 ring-1 ring-orange-400/30">
            mortgage active
          </span>
        )}
        {lead.recent_roof_permit_date && (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 font-medium text-amber-200"
            title="A recent roof permit penalises the score"
          >
            recent roof permit
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-800 pt-3 text-xs text-stone-400">
        <span className="font-mono">
          event #{lead.storm_event_id}
          {lead.storm_date && (
            <>
              {" "}
              &middot; {new Date(lead.storm_date).toLocaleDateString()}
            </>
          )}
        </span>
        <a
          href={googleMapsUrl(lead)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-orange-300 transition hover:text-orange-200"
        >
          <MapPin className="h-3.5 w-3.5" />
          Map
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </li>
  );
}
