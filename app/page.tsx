import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CloudLightning,
  FileSignature,
  Target,
} from "lucide-react";
import { getHailStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

const sampleLeads = [
  {
    address: "1156 HARGRAVE ST",
    city: "Austin, TX 78702",
    hailSize: '3"',
    hailDate: "May 28",
    permitDays: 18,
    contractor: "ABC Roofing",
  },
  {
    address: "4402 SHOAL CREEK BLVD",
    city: "Austin, TX 78756",
    hailSize: '2.5"',
    hailDate: "Jun 14",
    permitDays: 9,
    contractor: "Lone Star Exteriors",
  },
  {
    address: "8819 MOUNTAIN RIDGE DR",
    city: "Round Rock, TX 78681",
    hailSize: '2.75"',
    hailDate: "Apr 02",
    permitDays: 27,
    contractor: "Hillcountry Roof Co.",
  },
];

const tiers = [
  {
    name: "Basic",
    price: "$99",
    cadence: "/mo",
    tagline: "Non-exclusive per ZIP",
    bullets: [
      "Up to 3 ZIPs",
      "Weekly CSV exports",
      "Hail size, date, permit date",
      "Email support",
      "Shared with \u22644 other roofers",
    ],
    cta: "Start Basic",
  },
  {
    name: "Pro",
    price: "$499",
    cadence: "/mo",
    tagline: "Exclusive per ZIP",
    bullets: [
      "Up to 10 ZIPs, exclusive",
      "Daily refresh, live dashboard",
      "Contractor-on-permit intel",
      "Claim-cycle stage scoring",
      "Priority support + onboarding",
    ],
    featured: true,
    cta: "Start Pro",
  },
  {
    name: "Enterprise",
    price: "Contact",
    cadence: "",
    tagline: "Territory / multi-state",
    bullets: [
      "Full Texas coverage",
      "Custom API + Salesforce sync",
      "Exclusive metros",
      "Dedicated account manager",
      "SLA + volume pricing",
    ],
    cta: "Talk to us",
  },
];

export default async function LandingPage() {
  const stats = await getHailStats();

  const statCards = [
    { value: stats.matches, label: "storm \u00D7 permit matches" },
    { value: stats.addresses, label: "unique TX addresses" },
    { value: stats.counties, label: "Central TX counties" },
    { value: stats.refresh, label: "data refresh" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-indigo-50 via-slate-50 to-slate-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-12 -z-10 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl"
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-700">
              <CloudLightning className="h-3.5 w-3.5" />
              NOAA &times; Texas permits
            </span>
            <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
              Turn hail into
              <br className="hidden sm:block" />
              <span className="text-indigo-600"> roofing leads.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              PermitLookup joins NOAA storm data with every Texas roof permit
              pulled. See the addresses hit by hail AND already in a claim
              cycle &mdash; before your competitors.
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                href="/hail-leads"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-sm transition hover:bg-indigo-500"
              >
                See Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-base font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                View pricing
              </a>
            </div>
          </div>
          <div className="hidden md:col-span-4 md:block">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Live feed
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs text-slate-600">
                <FeedItem address="4402 SHOAL CREEK" detail={'hail 2.5" \u00B7 permit 9d'} />
                <FeedItem address="1156 HARGRAVE ST" detail={'hail 3" \u00B7 permit 18d'} />
                <FeedItem address="8819 MOUNTAIN RIDGE" detail={'hail 2.75" \u00B7 permit 27d'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-slate-200 md:grid-cols-4 md:divide-x">
          {statCards.map((s) => (
            <div key={s.label} className="px-6 py-10">
              <div className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Why roofers win with us
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Every address we surface is two data points wrapped into one lead.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ValueProp
            icon={<CalendarClock className="h-5 w-5" />}
            title="Fresh every morning"
            body="Overnight we re-ingest NOAA storm reports and the latest municipal permit filings. Your dashboard is current by 6 AM Central."
          />
          <ValueProp
            icon={<FileSignature className="h-5 w-5" />}
            title="Proof of intent"
            body={"A permit means the homeowner already picked a contractor \u2014 or is about to. You're not cold-knocking; you're timing the follow-up."}
          />
          <ValueProp
            icon={<Target className="h-5 w-5" />}
            title="Competitive intel"
            body="See which contractor pulled the permit. Undercut their warranty, match their timeline, or sell the homeowner on a second opinion."
          />
        </div>
      </section>

      {/* SAMPLE LEADS */}
      <section className="bg-slate-900 py-20 text-slate-100 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-400">
                Sample leads
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Three rows from yesterday&apos;s feed.
              </h2>
              <p className="mt-3 text-slate-400">
                Every lead tells you where the hail hit, how hard, and how
                quickly the homeowner moved.
              </p>
            </div>
            <Link
              href="/hail-leads"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              See the full dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {sampleLeads.map((lead) => (
              <article
                key={lead.address}
                className="rounded-xl border border-slate-800 bg-slate-800/40 p-6"
              >
                <div className="font-mono text-sm text-indigo-300">
                  {lead.address}
                </div>
                <div className="mt-1 text-xs text-slate-400">{lead.city}</div>
                <div className="mt-5 space-y-2 text-sm">
                  <Row
                    label="Hail"
                    value={`${lead.hailSize} on ${lead.hailDate}`}
                  />
                  <Row
                    label="Permit"
                    value={`pulled ${lead.permitDays} days later`}
                  />
                  <Row label="Contractor" value={lead.contractor} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="mx-auto max-w-6xl px-6 py-20 md:py-28"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Straightforward plans. ZIP exclusivity if you want it.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                "flex flex-col rounded-xl border bg-white p-8 shadow-sm transition " +
                (tier.featured
                  ? "border-indigo-500 ring-1 ring-indigo-500"
                  : "border-slate-200")
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
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
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href="/hail-leads"
                  className={
                    "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition " +
                    (tier.featured
                      ? "bg-indigo-600 text-white hover:bg-indigo-500"
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
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function FeedItem({ address, detail }: { address: string; detail: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="text-indigo-600">+ new match</div>
      <div className="mt-1 text-slate-700">{address}</div>
      <div className="text-slate-500">{detail}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="text-slate-100">{value}</span>
    </div>
  );
}
