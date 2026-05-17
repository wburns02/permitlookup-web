import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Database,
  Network,
  Radio,
  Zap,
} from "lucide-react";
import { BroadbandLookup } from "./lookup-client";

export const metadata: Metadata = {
  title: "Broadband Coverage API · 924M FCC records",
  description:
    "For any US address, get every ISP, technology, and speed in a single call. 924 million FCC broadband records, 116 million addresses, 2,135 providers.",
};

export const dynamic = "force-static";

const kpis = [
  { value: "924M", label: "FCC location records" },
  { value: "116M", label: "US addresses" },
  { value: "2,135", label: "ISPs covered" },
  { value: "3", label: "endpoints live" },
];

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    tagline: "No key required",
    bullets: [
      "100 lookups / day",
      "Same data as paid tiers",
      "/v1/broadband/lookup only",
      "Community support",
    ],
    cta: "Try it now",
    href: "#try-it",
  },
  {
    name: "Pro",
    price: "$50",
    cadence: "/mo",
    tagline: "Production keys",
    bullets: [
      "10,000 lookups / month",
      "All 3 endpoints (broadband, septic-score, rural-leads)",
      "API key + usage dashboard",
      "Email support",
    ],
    featured: true,
    cta: "Get API key",
    href: "mailto:contact@permitlookup.com?subject=Broadband%20Pro%20plan",
  },
  {
    name: "Enterprise",
    price: "$500",
    cadence: "/mo",
    tagline: "Volume + SLA",
    bullets: [
      "100,000 lookups / month",
      "Bulk CSV exports + warehouse sync",
      "Custom score weights",
      "Dedicated account manager",
      "SLA + volume pricing above 100K",
    ],
    cta: "Talk to us",
    href: "mailto:contact@permitlookup.com?subject=Broadband%20Enterprise%20plan",
  },
];

const endpoints = [
  {
    title: "Broadband Lookup",
    method: "GET",
    path: "/v1/broadband/lookup",
    blurb:
      "Every ISP serving an address — brand, technology, max download/upload, low-latency flag, business/residential code.",
    curl: `curl "https://permit-api-production-6eae.up.railway.app/v1/broadband/lookup?\\
address=1600+Pennsylvania+Avenue&city=Washington&state=DC&zip=20500" \\
  -H "X-API-Key: pl_live_..."`,
    response: `{
  "address": "1600 Pennsylvania Avenue",
  "state": "DC",
  "zip": "20500",
  "tract_geoid": "11001006202",
  "lat": 38.8977,
  "lon": -77.0365,
  "providers": [
    {
      "brand_name": "Verizon Fios",
      "technology": "fiber",
      "max_download_mbps": 5000,
      "max_upload_mbps": 5000,
      "low_latency": true,
      "business_residential": "X"
    }
  ],
  "max_download_mbps": 5000,
  "max_upload_mbps": 5000,
  "has_fiber": true,
  "has_cable": true,
  "only_satellite": false,
  "isp_count": 9,
  "fiber_isp_count": 2,
  "source": "fcc_bdc",
  "match_method": "block_match"
}`,
  },
  {
    title: "Septic Score Lookup",
    method: "GET",
    path: "/v1/septic-score/lookup",
    blurb:
      "Returns the v2 rural_septic_score (0-100) for a TX address with component breakdown. Higher = stronger rural-septic signal.",
    curl: `curl "https://permit-api-production-6eae.up.railway.app/v1/septic-score/lookup?\\
address=5160+FM+55&city=Italy&state=TX&zip=76651" \\
  -H "X-API-Key: pl_live_..."`,
    response: `{
  "address": "5160 FM 55",
  "state": "TX",
  "zip": "76651",
  "score": 85,
  "tier": "high-rural",
  "components": {
    "urban_area_signal": 30,
    "pop_density_signal": 20,
    "broadband_signal": 25,
    "joint_bonus": 15
  },
  "interpretation": "Strong rural-septic indicator",
  "confidence": "high",
  "source": "materialized_view",
  "county_name": "Ellis"
}`,
  },
  {
    title: "Rural Leads by County",
    method: "GET",
    path: "/v1/rural-leads/county",
    blurb:
      "Ranked rural-septic leads by TX county. 1 lookup per 25 leads returned (min 1). Min score and limit are tunable.",
    curl: `curl "https://permit-api-production-6eae.up.railway.app/v1/rural-leads/county?\\
county=Llano&state=TX&min_score=70&limit=100" \\
  -H "X-API-Key: pl_live_..."`,
    response: `{
  "county": "Llano",
  "state": "TX",
  "min_score": 70,
  "count": 100,
  "leads": [
    {
      "permit_id": 84221993,
      "permit_number": "OSSF-2025-1102",
      "address": "FM 1431",
      "city": "Kingsland",
      "zip": "78639",
      "county_name": "Llano",
      "rural_septic_score": 92,
      "max_dl_mbps": 25,
      "fiber_isp_count": 0,
      "isp_count": 2,
      "only_satellite": false
    }
  ]
}`,
  },
];

export default function BroadbandPage() {
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
              <Network className="h-3.5 w-3.5" />
              FCC BDC &times; 116M US addresses
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
              Broadband Coverage
              <br className="hidden sm:block" />
              <span className="text-emerald-600"> API.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              For any US address, get every ISP, technology, and speed in a
              single call. 924 million FCC broadband records, 116 million
              addresses, 2,135 providers &mdash; one HTTP GET away.
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="#try-it"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-emerald-500"
              >
                Try it <ArrowRight className="h-4 w-4" />
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
                /v1/broadband/lookup
              </div>
              <pre className="mt-4 overflow-x-auto rounded-md bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
{`{
  "isp_count": 9,
  "max_download_mbps": 5000,
  "has_fiber": true,
  "providers": [
    {
      "brand_name": "Verizon Fios",
      "technology": "fiber",
      "max_download_mbps": 5000
    },
    ...
  ]
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
      <section
        id="try-it"
        className="mx-auto max-w-6xl px-6 py-20 md:py-28"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Live lookup
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Try the API in your browser.
          </h2>
          <p className="mt-3 text-slate-600">
            Hits the same production endpoint your code would &mdash; no key
            required for this demo widget. Default address is prefilled below.
          </p>
        </div>
        <div className="mt-10">
          <BroadbandLookup />
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              What you get
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              One call. Every ISP. Every technology.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <ValueProp
              icon={<Database className="h-5 w-5" />}
              title="924M FCC records"
              body="The full FCC Broadband Data Collection, partitioned by state for sub-second range scans. 116 million unique broadband-serviceable locations across all 50 states + DC + PR."
            />
            <ValueProp
              icon={<Radio className="h-5 w-5" />}
              title="2,135 ISPs covered"
              body="Brand, holding company, technology code (fiber / cable / copper / fixed-wireless / satellite), max download, max upload, low-latency flag, residential/business split."
            />
            <ValueProp
              icon={<Zap className="h-5 w-5" />}
              title="Sub-second lookups"
              body="Address resolution flows through property_sales fuzzy match → block geoid → BDC range scan → JSON. Falls back to tract centroid if the block isn't matched."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto max-w-6xl px-6 py-20 md:py-28"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Free to try. Pay only when you scale.
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
                  <span className="text-sm text-slate-500">{tier.cadence}</span>
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
      </section>

      {/* DOCS */}
      <section id="docs" className="bg-slate-900 py-20 text-slate-100 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              Endpoints
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Three GETs. JSON in, JSON out.
            </h2>
            <p className="mt-3 text-slate-400">
              All three endpoints are live on Railway behind an X-API-Key
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
          . See the other 19 products at{" "}
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

function ValueProp({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}
