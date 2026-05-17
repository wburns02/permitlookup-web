import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  CloudHail,
  Database,
  FileText,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { StormStrikeLookup } from "./lookup-client";

export const metadata: Metadata = {
  title: "Storm Strike Dispatch · Roofer Leads in 48 Hours",
  description:
    "Within 48 hours of a hail event, get ranked rooftop addresses ready for outreach. 15K TX hail events, 35M mortgage records, 297M code-violation distress signals. One API call.",
};

export const dynamic = "force-static";

const kpis = [
  { value: "15K", label: "TX hail events since 2014" },
  { value: "35M", label: "mortgage records" },
  { value: "771K", label: "all NOAA storm events" },
  { value: "2", label: "endpoints live" },
];

const tiers = [
  {
    name: "Pay per lead",
    price: "$50",
    cadence: "/lead",
    tagline: "Prepaid, no monthly commitment",
    bullets: [
      "10-pack — $500",
      "100-pack — $4,500 (10% off)",
      "Every lead is composite-scored 0-100",
      "Address, lat/lon, storm event, magnitude, distance",
      "Replace any zero-contact lead within 30 days",
    ],
    cta: "Get a starter pack",
    href: "mailto:contact@permitlookup.com?subject=Storm%20Strike%20-%20Pay%20per%20lead",
  },
  {
    name: "Territory",
    price: "$500",
    cadence: "/mo",
    tagline: "Exclusive within geo",
    bullets: [
      "Single TX county exclusive — $500/mo",
      "TX metro region (HOU / DFW / SAT / AUS) — $1,000/mo",
      "Unlimited leads in your footprint",
      "First 48-hour notification on new strikes",
      "Cancel anytime, no setup fee",
    ],
    featured: true,
    cta: "Claim a territory",
    href: "mailto:contact@permitlookup.com?subject=Storm%20Strike%20-%20Territory",
  },
  {
    name: "Enterprise",
    price: "$2,500",
    cadence: "/mo",
    tagline: "Multi-state API",
    bullets: [
      "Multi-state coverage (TX + FL + GA + NC + SC)",
      "Direct API access with your own X-API-Key",
      "Custom score weights per business model",
      "Webhook delivery on new qualifying strikes",
      "Dedicated Slack channel",
    ],
    cta: "Talk to us",
    href: "mailto:contact@permitlookup.com?subject=Storm%20Strike%20-%20Enterprise",
  },
];

const useCases = [
  {
    icon: <Radar className="h-5 w-5" />,
    title: "Pre-storm targeting",
    body: "Pull older homes with active mortgages inside the forecast cone. Door-knock the path before the storm even hits.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "48-hour rapid response",
    body: "Within two days of NOAA logging the event, get every parcel inside the hail footprint scored and ready for outbound.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Insurance claim correlation",
    body: "Cross-reference hail magnitude with mortgage status and home age to predict which addresses will actually file a claim.",
  },
];

const endpoints = [
  {
    title: "Recent strikes by state",
    method: "GET",
    path: "/v1/roofer-leads/recent",
    blurb:
      "Rolling cross-event hail leads for a state. Ranks every parcel inside any storm footprint logged in the last N days by composite score.",
    curl: `curl "https://permit-api-production-6eae.up.railway.app/v1/roofer-leads/recent?\\
state=TX&days_back=14&min_score=50&limit=100" \\
  -H "X-API-Key: pl_live_..."`,
    response: `{
  "state": "TX",
  "days_back": 14,
  "min_score": 50,
  "event_count": 7,
  "count": 142,
  "leads": [
    {
      "address": "1812 Bluebonnet Trl",
      "city": "Round Rock",
      "state": "TX",
      "zip": "78664",
      "county": "Williamson",
      "lat": 30.5083,
      "lon": -97.6789,
      "year_built": 1998,
      "has_active_mortgage": true,
      "recent_roof_permit_date": null,
      "storm_event_id": 1098221,
      "storm_date": "2026-05-11T18:23:00Z",
      "days_after_storm": 4,
      "storm_magnitude": 1.75,
      "composite_score": 87.4,
      "components": {
        "storm_severity": 22.5,
        "home_age_score": 18.0,
        "mortgage_score": 20.0,
        "roof_permit_recency_penalty": 0.0,
        "distance_miles": 3.4
      }
    }
  ]
}`,
  },
  {
    title: "Leads by hail event",
    method: "GET",
    path: "/v1/roofer-leads/by-hail-event",
    blurb:
      "Ranked rooftop leads inside a single storm event's footprint. Pin a NOAA event_id, expand the radius, and pull every scored parcel.",
    curl: `curl "https://permit-api-production-6eae.up.railway.app/v1/roofer-leads/by-hail-event?\\
event_id=1098221&days_after=120&radius_miles=20&min_score=50" \\
  -H "X-API-Key: pl_live_..."`,
    response: `{
  "event": {
    "event_id": 1098221,
    "state": "TX",
    "begin_date": "2026-05-11T18:23:00Z",
    "magnitude": 1.75,
    "centroid_lat": 30.51,
    "centroid_lon": -97.68
  },
  "days_after": 120,
  "radius_miles": 20,
  "min_magnitude": 1.0,
  "count": 412,
  "leads": [ ... RooferLeadItem ... ]
}`,
  },
];

export default function RoofersPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 -z-10 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
              <CloudHail className="h-3.5 w-3.5" />
              NOAA &times; 35M mortgages &times; 297M distress signals
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
              Storm Strike
              <br className="hidden sm:block" />
              <span className="text-emerald-600"> Dispatch.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Within 48 hours of a hail event, get ranked rooftop addresses
              ready for outreach. 15K TX hail events. 35M mortgage records.
              297M code-violation distress signals. One API call.
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#try-it"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
              >
                Try recent strikes <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#docs"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                See the docs
              </a>
            </div>
          </div>
          <div className="hidden md:col-span-4 md:block">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                /v1/roofer-leads/recent
              </div>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
{`{
  "state": "TX",
  "event_count": 7,
  "count": 142,
  "leads": [{
    "address": "1812 Bluebonnet Trl",
    "city": "Round Rock",
    "composite_score": 87.4,
    "storm_magnitude": 1.75,
    "days_after_storm": 4,
    "has_active_mortgage": true
  }, ...]
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-slate-200 md:grid-cols-4 md:divide-x">
          {kpis.map((s) => (
            <div key={s.label} className="px-6 py-10">
              <div className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE LOOKUP */}
      <section id="try-it" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Live recent strikes
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Find storm-strike leads in your state.
          </h2>
          <p className="mt-3 text-slate-600">
            Hits the same production endpoint your code would &mdash; no key
            required for this demo widget. Pick a state, dial in your
            recency window, and we&apos;ll surface the top-scoring rooftops.
          </p>
        </div>
        <div className="mt-10">
          <StormStrikeLookup />
        </div>
      </section>

      {/* USE CASES */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Three ways roofers run it
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Built for the 48-hour window that matters.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  {u.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {u.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {u.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCORE BREAKDOWN */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              How we rank
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Composite score, 0&ndash;100.
            </h2>
            <p className="mt-4 text-slate-600">
              Every rooftop in the storm footprint gets scored on four
              signals. The result is one number you can rank against and
              dispatch on.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <ScoreRow
                icon={<CloudHail className="h-4 w-4" />}
                label="Storm severity"
                weight="0&ndash;30"
                body="Normalised from NOAA hail size in inches. 2.75&Prime; baseballs cap the score."
              />
              <ScoreRow
                icon={<Database className="h-4 w-4" />}
                label="Home age"
                weight="0&ndash;25"
                body="Older homes score higher &mdash; more likely to qualify for a full replacement."
              />
              <ScoreRow
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Mortgage active"
                weight="0&ndash;20"
                body="Active mortgage means insurance + escrow are already in place. Big claim signal."
              />
              <ScoreRow
                icon={<FileText className="h-4 w-4" />}
                label="Recent roof permit penalty"
                weight="0&ndash;&minus;20"
                body="Suppress rooftops already replaced. We pull permits weekly and zero out the recently-roofed."
              />
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              components example
            </div>
            <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
{`"components": {
  "storm_severity":            22.5,  // 1.75" hail
  "home_age_score":            18.0,  // built 1998
  "mortgage_score":            20.0,  // active
  "roof_permit_recency_penalty": 0.0, // never replaced
  "distance_miles":             3.4
}
// composite_score = 87.4 / 100`}
            </pre>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Pay per lead, claim a territory, or wire the API.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  "flex flex-col rounded-xl border bg-white p-8 shadow-sm transition " +
                  (tier.featured
                    ? "border-emerald-500 ring-1 ring-emerald-500"
                    : "border-slate-200")
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900">
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span className="text-sm text-slate-500">
                      {tier.cadence}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">{tier.tagline}</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-600">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={tier.href}
                    className={
                      "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition " +
                      (tier.featured
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50")
                    }
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOCS */}
      <section id="docs" className="bg-slate-900 py-20 text-slate-100 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              Endpoints
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Two GETs. JSON in, JSON out.
            </h2>
            <p className="mt-3 text-slate-400">
              Both endpoints are live on Railway behind an X-API-Key
              header. Sample curls and response shapes below.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {endpoints.map((ep) => (
              <article
                key={ep.path}
                className="rounded-xl border border-slate-800 bg-slate-800/40 p-6 md:p-8"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-emerald-300">
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-slate-100">
                    {ep.path}
                  </code>
                  <span className="text-sm font-medium text-slate-300">
                    &mdash; {ep.title}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm text-slate-400">
                  {ep.blurb}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Request
                    </div>
                    <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
                      {ep.curl}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Response
                    </div>
                    <pre className="overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
                      {ep.response}
                    </pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-500">
          Part of the{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="text-emerald-600 hover:text-emerald-500"
          >
            ecbtx.com data portfolio
          </a>
          . See the full lineup at{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="text-emerald-600 hover:text-emerald-500"
          >
            portfolio.ecbtx.com
          </a>
          .
        </div>
      </section>
    </>
  );
}

function ScoreRow({
  icon,
  label,
  weight,
  body,
}: {
  icon: React.ReactNode;
  label: string;
  weight: React.ReactNode;
  body: string;
}) {
  return (
    <li className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-slate-900">{label}</span>
          <span className="font-mono text-xs text-slate-500">{weight}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{body}</p>
      </div>
    </li>
  );
}
