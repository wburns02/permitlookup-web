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

type ScoreSignal = {
  icon: React.ReactNode;
  label: string;
  weight: React.ReactNode;
  body: React.ReactNode;
};

const scoreSignals: ScoreSignal[] = [
  {
    icon: <CloudHail className="h-4 w-4" />,
    label: "Storm severity",
    weight: <>0&ndash;30</>,
    body: (
      <>
        Normalised from NOAA hail size in inches. 2.75&Prime; baseballs cap the
        score.
      </>
    ),
  },
  {
    icon: <Database className="h-4 w-4" />,
    label: "Home age",
    weight: <>0&ndash;25</>,
    body: (
      <>
        Older homes score higher &mdash; more likely to qualify for a full
        replacement.
      </>
    ),
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    label: "Mortgage active",
    weight: <>0&ndash;20</>,
    body: (
      <>
        Active mortgage means insurance + escrow are already in place. Big
        claim signal.
      </>
    ),
  },
  {
    icon: <FileText className="h-4 w-4" />,
    label: "Recent roof permit penalty",
    weight: <>0&ndash;&minus;20</>,
    body: (
      <>
        Suppress rooftops already replaced. We pull permits weekly and zero
        out the recently-roofed.
      </>
    ),
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
    <div data-theme="roofers" className="theme-shell">
      {/* HERO */}
      <section className="relative overflow-hidden hero-roofers">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-8">
            <span className="brand-pill">
              <Radar className="h-3.5 w-3.5" />
              NOAA &times; 35M mortgages &times; 297M signals
            </span>
            <h1 className="brand-heading mt-6 text-balance text-5xl font-bold uppercase leading-[1.02] tracking-tight md:text-6xl">
              Storm Strike
              <br className="hidden sm:block" />
              <span className="brand-text"> Dispatch.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed brand-muted">
              Within 48 hours of a hail event, get ranked rooftop addresses
              ready for outreach. 15K TX hail events. 35M mortgage records.
              297M code-violation distress signals.{" "}
              <span className="font-semibold brand-text-soft">
                One API call.
              </span>
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#try-it"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 text-base font-semibold uppercase tracking-wide text-stone-950 shadow-[0_0_30px_-8px_rgba(249,115,22,0.7)] transition hover:bg-orange-400"
              >
                Strike now <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#docs"
                className="inline-flex items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/5 px-6 py-3.5 text-base font-medium text-orange-200 transition hover:border-orange-400 hover:bg-orange-500/10"
              >
                See the docs
              </a>
            </div>
          </div>
          <div className="hidden md:col-span-4 md:block">
            <div className="relative rounded-2xl border border-orange-500/25 bg-[#160a04]/80 p-6 shadow-[0_0_40px_-12px_rgba(249,115,22,0.45)] backdrop-blur">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-400">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.85)]" />
                /v1/roofer-leads/recent
              </div>
              <pre className="mt-4 overflow-x-auto rounded-md bg-[#0b0604] p-4 font-mono text-[11px] leading-relaxed text-stone-200 ring-1 ring-orange-500/15">
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
      <section className="themed-kpi">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 md:divide-x md:divide-orange-500/10">
          {kpis.map((s) => (
            <div key={s.label} className="px-6 py-10">
              <div className="text-3xl font-bold tracking-tight themed-kpi-value md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider themed-kpi-label">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE LOOKUP */}
      <section id="try-it" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="brand-eyebrow">Live recent strikes</p>
          <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Find storm-strike leads in your state.
          </h2>
          <p className="mt-3 brand-muted">
            Hits the same production endpoint your code would &mdash; no key
            required for this demo widget. Pick a state, dial in your
            recency window, and we&apos;ll surface the top-scoring rooftops.
          </p>
        </div>
        <div className="mt-10 lookup-on-dark">
          <StormStrikeLookup />
        </div>
      </section>

      {/* USE CASES */}
      <section className="border-y border-orange-500/10 bg-[#0e0805]/70">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="brand-eyebrow">Three ways roofers run it</p>
            <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Built for the 48-hour window that matters.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {useCases.map((u) => (
              <div
                key={u.title}
                className="brand-card p-8 transition hover:border-orange-400/40"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/25">
                  {u.icon}
                </div>
                <h3 className="brand-heading mt-5 text-lg font-semibold">
                  {u.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed brand-muted">
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
            <p className="brand-eyebrow">How we rank</p>
            <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Composite score, 0&ndash;100.
            </h2>
            <p className="mt-4 brand-muted">
              Every rooftop in the storm footprint gets scored on four
              signals. The result is one number you can rank against and
              dispatch on.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              {scoreSignals.map((s) => (
                <ScoreRow
                  key={s.label}
                  icon={s.icon}
                  label={s.label}
                  weight={s.weight}
                  body={s.body}
                />
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-[#0b0604] p-6 shadow-[0_0_40px_-12px_rgba(249,115,22,0.35)]">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-stone-400">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.85)]" />
              components example
            </div>
            <pre className="mt-4 overflow-x-auto rounded-md bg-[#050302] p-4 font-mono text-[11px] leading-relaxed text-stone-100 ring-1 ring-orange-500/15">
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
      <section id="pricing" className="border-y border-orange-500/10 bg-[#0e0805]/70">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="brand-eyebrow">Pricing</p>
            <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Pay per lead, claim a territory, or wire the API.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  "flex flex-col rounded-xl border bg-[#14100d] p-8 shadow-sm transition " +
                  (tier.featured
                    ? "border-orange-400/60 ring-1 ring-orange-400/40 shadow-[0_0_40px_-12px_rgba(249,115,22,0.5)]"
                    : "border-stone-700/60")
                }
              >
                <div className="flex items-center justify-between">
                  <h3 className="brand-heading text-lg font-semibold">
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-300">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-stone-50">
                    {tier.price}
                  </span>
                  {tier.cadence && (
                    <span className="text-sm brand-faint">{tier.cadence}</span>
                  )}
                </div>
                <p className="mt-1 text-sm brand-muted">{tier.tagline}</p>
                <ul className="mt-6 space-y-3 text-sm brand-muted">
                  {tier.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={tier.href}
                    className={
                      "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition " +
                      (tier.featured
                        ? "bg-orange-500 text-stone-950 hover:bg-orange-400"
                        : "border border-orange-500/30 bg-orange-500/5 text-orange-200 hover:bg-orange-500/10")
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
      <section
        id="docs"
        className="border-t border-orange-500/10 bg-[#08060a] py-20 md:py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="brand-eyebrow">Endpoints</p>
            <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Two GETs. JSON in, JSON out.
            </h2>
            <p className="mt-3 brand-muted">
              Both endpoints are live on Railway behind an X-API-Key
              header. Sample curls and response shapes below.
            </p>
          </div>
          <div className="mt-12 space-y-10">
            {endpoints.map((ep) => (
              <article
                key={ep.path}
                className="rounded-xl border border-stone-800 bg-[#14100d]/70 p-6 md:p-8"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="rounded-md bg-orange-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-orange-300 ring-1 ring-orange-500/30">
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-orange-100">
                    {ep.path}
                  </code>
                  <span className="text-sm font-medium text-stone-300">
                    &mdash; {ep.title}
                  </span>
                </div>
                <p className="mt-3 max-w-3xl text-sm brand-muted">
                  {ep.blurb}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-orange-400">
                      Request
                    </div>
                    <pre className="overflow-x-auto rounded-md border border-stone-800 bg-[#050302] p-4 font-mono text-[11px] leading-relaxed text-stone-200">
                      {ep.curl}
                    </pre>
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-orange-400">
                      Response
                    </div>
                    <pre className="overflow-x-auto rounded-md border border-stone-800 bg-[#050302] p-4 font-mono text-[11px] leading-relaxed text-stone-200">
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
      <section className="border-t border-orange-500/10 bg-[#0b0a0a]">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm brand-muted">
          Part of the{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="text-orange-300 hover:text-orange-200"
          >
            ecbtx.com data portfolio
          </a>
          . See the full lineup at{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="text-orange-300 hover:text-orange-200"
          >
            portfolio.ecbtx.com
          </a>
          .
        </div>
      </section>
    </div>
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
  body: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 rounded-lg border border-orange-500/15 bg-[#14100d] p-4">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-stone-100">{label}</span>
          <span className="font-mono text-xs brand-faint">{weight}</span>
        </div>
        <p className="mt-1 text-xs leading-relaxed brand-muted">{body}</p>
      </div>
    </li>
  );
}
