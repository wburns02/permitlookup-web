import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  ClipboardList,
  Compass,
  Database,
  FileText,
  Layers,
  MapPin,
  Radar,
  ShieldCheck,
  Truck,
  Users,
  X,
} from "lucide-react";
import { RoofCrmInterestForm } from "./cta-client";

export const metadata: Metadata = {
  title: "RoofCRM · The Operating System for Texas Roofing Contractors",
  description:
    "Estimates, claims, dispatch, photo docs, and a customer portal — built for Texas roofers, powered by the same data layer behind Storm Strike Dispatch.",
};

export const dynamic = "force-static";

const heroKpis = [
  { value: "37", label: "portfolio products" },
  { value: "6.21x", label: "AI-validated rural lead lift" },
  { value: "$4.25B+", label: "records in our data layer" },
];

const features = [
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Estimate from drone photos",
    body: "AI-assisted measurement reads roof pitch, area, and damage from drone or satellite imagery. Pulls EagleView-style estimates without the EagleView bill.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Claim status auto-sync",
    body: "Pulls live status from TX DOI public adjuster filings and major carrier portals. Stop calling Travelers; the timeline shows up in the job card.",
  },
  {
    icon: <Radar className="h-5 w-5" />,
    title: "Storm-driven dispatch",
    body: "Auto-queue leads straight from Storm Strike Dispatch. Composite-scored addresses inside the hail footprint route to the nearest crew in 30 seconds.",
  },
  {
    icon: <ClipboardList className="h-5 w-5" />,
    title: "Photo documentation",
    body: "Every photo is date-stamped, GPS-verified, and hashed for tamper detection. Underwriters can scan a QR code and trust what they see.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Customer portal",
    body: "Homeowners track their job status, sign change orders, and pay deposits without calling the office. Built-in SMS to keep them updated.",
  },
  {
    icon: <Truck className="h-5 w-5" />,
    title: "Crew + truck GPS",
    body: "Samsara-style fleet tracking with geofenced job sites. Know when a crew arrived, how long they were on the roof, and when they left.",
  },
];

const integrations = [
  {
    icon: <Radar className="h-4 w-4" />,
    name: "Storm Strike Dispatch",
    path: "/v1/roofer-leads/recent · /by-hail-event",
    body: "Composite-scored hail leads inside the 48-hour window. Pipes to your dispatch queue.",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    name: "permits.ecbtx.com",
    path: "Texas roof + reroof permits, weekly refresh",
    body: "Suppress addresses already permitted; surface neighbors who just pulled a permit.",
  },
  {
    icon: <MapPin className="h-4 w-4" />,
    name: "FCC broadband + code violations",
    path: "297M distress signals",
    body: "Older neighborhoods with rising violation counts skew higher on full-replacement scoring.",
  },
  {
    icon: <Database className="h-4 w-4" />,
    name: "HMDA + mortgage layer",
    path: "35M active TX mortgage records",
    body: "Active escrow + insurance is the strongest claim-likelihood signal we measure.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "$400",
    cadence: "/mo per crew",
    tagline: "1-3 trucks",
    bullets: [
      "CRM + dispatch + estimates",
      "Storm Strike lead feed (limited to your county)",
      "Photo docs (GPS-stamped)",
      "Customer portal + SMS",
      "Mobile app (iOS + Android)",
    ],
    cta: "Start a pilot",
    href: "mailto:will@ecbtx.com?subject=RoofCRM%20Starter",
  },
  {
    name: "Growth",
    price: "$800",
    cadence: "/mo per crew",
    tagline: "4-10 trucks",
    featured: true,
    bullets: [
      "Everything in Starter",
      "Claim status auto-sync (TX DOI + carriers)",
      "Drone-photo estimation",
      "Multi-county lead feed",
      "Truck + crew GPS",
      "Priority support",
    ],
    cta: "Book a demo",
    href: "mailto:will@ecbtx.com?subject=RoofCRM%20Growth",
  },
  {
    name: "Enterprise",
    price: "$2,000",
    cadence: "/mo per crew",
    tagline: "10+ trucks",
    bullets: [
      "Everything in Growth",
      "AI photo doc review (tamper detection)",
      "Custom workflows + approval chains",
      "Statewide lead feed, exclusive metros",
      "Dedicated Slack channel + onboarding",
      "Custom reports + BI exports",
    ],
    cta: "Talk to us",
    href: "mailto:will@ecbtx.com?subject=RoofCRM%20Enterprise",
  },
];

type CompareRow = {
  label: string;
  roofcrm: string | boolean;
  proroof: string | boolean;
  roofr: string | boolean;
  jobnimbus: string | boolean;
};

const compareRows: CompareRow[] = [
  {
    label: "Built specifically for Texas",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: false,
  },
  {
    label: "Owns its own hail-event data",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: false,
  },
  {
    label: "Owns its own permit data",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: false,
  },
  {
    label: "Owns mortgage + insurance signal",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: false,
  },
  {
    label: "Drone-photo estimation",
    roofcrm: true,
    proroof: "Add-on",
    roofr: true,
    jobnimbus: false,
  },
  {
    label: "Customer portal",
    roofcrm: true,
    proroof: true,
    roofr: true,
    jobnimbus: true,
  },
  {
    label: "Crew + truck GPS",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: "Add-on",
  },
  {
    label: "Storm-event auto-dispatch",
    roofcrm: true,
    proroof: false,
    roofr: false,
    jobnimbus: false,
  },
  {
    label: "Price per crew",
    roofcrm: "$400-$2,000",
    proroof: "$1,500+",
    roofr: "$249+",
    jobnimbus: "$300+",
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c87b3e]/20 ring-1 ring-[#c87b3e]/40">
        <Check className="h-3.5 w-3.5 text-[#e0975a]" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/30 ring-1 ring-slate-700/60">
        <X className="h-3.5 w-3.5 text-slate-500" />
      </span>
    );
  }
  return <span className="text-xs font-medium text-slate-300">{value}</span>;
}

export default function RoofersOsPage() {
  return (
    <div
      data-theme="roofers-os"
      className="theme-shell font-sans"
      style={{ fontFamily: '"Inter", ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* HERO */}
      <section className="relative overflow-hidden hero-roofers-os">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-20 md:grid-cols-12 md:pt-28">
          <div className="md:col-span-7">
            <span
              className="brand-pill"
              style={{
                color: "#e0975a",
                borderColor: "rgba(200,123,62,0.3)",
              }}
            >
              <Compass className="h-3.5 w-3.5" />
              Vertical SaaS &middot; Beta
            </span>
            <h1
              className="brand-heading mt-6 text-balance text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl md:text-6xl"
              style={{
                fontFamily:
                  '"Inter", ui-serif, Georgia, "Times New Roman", serif',
                letterSpacing: "-0.025em",
              }}
            >
              Run your TX roofing business in{" "}
              <span style={{ color: "#e0975a" }}>one app.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed brand-muted">
              Estimates, claims, dispatch, photo docs, customer portal &mdash;
              built specifically for Texas roofers. Powered by the same data
              layer behind{" "}
              <a
                href="https://storms.ecbtx.com"
                className="font-semibold underline decoration-[#c87b3e]/40 underline-offset-2 hover:decoration-[#c87b3e]"
                style={{ color: "#f4e3d1" }}
              >
                Storm Strike Dispatch
              </a>
              .
            </p>
            <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <a
                href="mailto:will@ecbtx.com?subject=RoofCRM%20demo"
                className="copper-cta inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base uppercase tracking-wide"
              >
                Book a demo <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="copper-border inline-flex items-center justify-center rounded-lg px-6 py-3.5 text-base font-semibold transition"
              >
                See pricing
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 sm:gap-6">
              {heroKpis.map((k) => (
                <div key={k.label} className="min-w-0">
                  <div
                    className="text-xl font-bold tracking-tight sm:text-2xl"
                    style={{ color: "#f4e3d1" }}
                  >
                    {k.value}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider brand-faint sm:text-[11px]">
                    {k.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blueprint product card */}
          <div className="md:col-span-5">
            <div
              className="blueprint-frame relative overflow-hidden rounded-2xl p-6 shadow-[0_0_60px_-20px_rgba(200,123,62,0.5)]"
              style={{ borderColor: "rgba(200,123,62,0.25)" }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between border-b border-[#c87b3e]/15 pb-3">
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-[#e0975a] shadow-[0_0_8px_rgba(200,123,62,0.85)]" />
                    job #4271 · Round Rock
                  </div>
                  <span
                    className="rounded-md bg-[#c87b3e]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "#e0975a" }}
                  >
                    Storm lead
                  </span>
                </div>
                <div className="mt-4 space-y-2.5 font-mono text-[11px] leading-relaxed text-slate-300">
                  <Row label="address" value="1812 Bluebonnet Trl" />
                  <Row label="claim_status" value="adjuster scheduled" copper />
                  <Row label="composite_score" value="87.4 / 100" />
                  <Row label="storm_event" value="2026-05-11 · 1.75&quot; hail" />
                  <Row label="estimate" value="$18,420 · 22.3 sq · 4/12 pitch" />
                  <Row label="crew_assigned" value="Crew 3 · ETA 09:15" />
                  <Row label="photos" value="14 · GPS verified" />
                </div>
                <div className="mt-5 flex gap-2">
                  <span
                    className="copper-cta rounded-md px-3 py-1.5 text-[11px] uppercase tracking-wider"
                    style={{ display: "inline-block" }}
                  >
                    Dispatch
                  </span>
                  <span className="rounded-md border border-[#c87b3e]/30 bg-[#c87b3e]/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                    View claim
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="brand-eyebrow" style={{ color: "#e0975a" }}>
            Six tools, one app
          </p>
          <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Everything a TX roofer touches in a day.
          </h2>
          <p className="mt-3 brand-muted">
            We rebuilt the contractor stack from scratch on top of our own
            data layer &mdash; no integrations, no zaps, no copy-paste.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="brand-card p-7 transition hover:border-[#c87b3e]/40"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1"
                style={{
                  background: "rgba(200,123,62,0.10)",
                  color: "#e0975a",
                  borderColor: "rgba(200,123,62,0.25)",
                }}
              >
                {f.icon}
              </div>
              <h3 className="brand-heading mt-5 text-lg font-bold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed brand-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATIONS / DATA LAYER */}
      <section
        id="integrations"
        className="border-y border-[#c87b3e]/15 bg-[#0b1018]/80"
      >
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid gap-12 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5">
              <p className="brand-eyebrow" style={{ color: "#e0975a" }}>
                We own the data layer
              </p>
              <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Not just a CRM. A data company that ships a CRM.
              </h2>
              <p className="mt-4 brand-muted">
                The competition rents leads from third parties. RoofCRM pulls
                from the same proprietary data pool that powers all 37
                products in the{" "}
                <a
                  href="https://portfolio.ecbtx.com"
                  className="underline decoration-[#c87b3e]/40 hover:decoration-[#c87b3e]"
                  style={{ color: "#f4e3d1" }}
                >
                  ecbtx portfolio
                </a>
                .
              </p>
              <div className="mt-8 inline-flex items-center gap-3 rounded-lg border border-[#c87b3e]/20 bg-[#c87b3e]/5 px-4 py-3">
                <Layers className="h-5 w-5" style={{ color: "#e0975a" }} />
                <span className="text-sm font-medium text-slate-100">
                  2.5B rows &middot; 1.1 TB on disk &middot; 50 states
                </span>
              </div>
            </div>
            <div className="md:col-span-7 space-y-4">
              {integrations.map((i) => (
                <div
                  key={i.name}
                  className="grid grid-cols-[40px_1fr] gap-4 rounded-xl border border-[#c87b3e]/15 bg-[#141a23] p-5"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-md ring-1"
                    style={{
                      background: "rgba(200,123,62,0.10)",
                      color: "#e0975a",
                      borderColor: "rgba(200,123,62,0.25)",
                    }}
                  >
                    {i.icon}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-bold text-slate-100">
                        {i.name}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {i.path}
                      </span>
                    </div>
                    <p className="mt-1 text-sm brand-muted">{i.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="brand-eyebrow" style={{ color: "#e0975a" }}>
            Pricing
          </p>
          <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Per crew, not per seat.
          </h2>
          <p className="mt-3 brand-muted">
            Crews scale with your business. Seats don&apos;t. We bill by the
            number of trucks rolling out of your yard each morning.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                "flex flex-col rounded-xl border p-8 transition " +
                (tier.featured
                  ? "border-[#c87b3e]/60 bg-[#1a1410] ring-1 ring-[#c87b3e]/40 shadow-[0_0_50px_-15px_rgba(200,123,62,0.55)]"
                  : "border-[#c87b3e]/15 bg-[#141a23]")
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="brand-heading text-lg font-bold tracking-tight">
                  {tier.name}
                </h3>
                {tier.featured && (
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                    style={{
                      background: "rgba(200,123,62,0.18)",
                      color: "#e0975a",
                    }}
                  >
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold tracking-tight"
                  style={{ color: "#f4e3d1" }}
                >
                  {tier.price}
                </span>
                <span className="text-sm brand-faint">{tier.cadence}</span>
              </div>
              <p className="mt-1 text-sm brand-muted">{tier.tagline}</p>
              <ul className="mt-6 space-y-3 text-sm brand-muted">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "#e0975a" }}
                    />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  href={tier.href}
                  className={
                    "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm uppercase tracking-wide transition " +
                    (tier.featured
                      ? "copper-cta"
                      : "copper-border font-semibold")
                  }
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARE TABLE */}
      <section id="compare" className="border-y border-[#c87b3e]/15 bg-[#0b1018]/80">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="brand-eyebrow" style={{ color: "#e0975a" }}>
              How RoofCRM compares
            </p>
            <h2 className="brand-heading mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              The only contractor app that owns its data.
            </h2>
            <p className="mt-3 brand-muted">
              Every other CRM in this category is a thin wrapper over the same
              third-party feeds. We built the feeds.
            </p>
          </div>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[#c87b3e]/20 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Feature
                  </th>
                  <th
                    className="border-b border-[#c87b3e]/40 bg-[#c87b3e]/8 px-4 py-3 text-center text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#e0975a" }}
                  >
                    RoofCRM
                  </th>
                  <th className="border-b border-[#c87b3e]/20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    ProRoof
                  </th>
                  <th className="border-b border-[#c87b3e]/20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Roofr
                  </th>
                  <th className="border-b border-[#c87b3e]/20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    JobNimbus
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, idx) => (
                  <tr key={row.label}>
                    <td
                      className={
                        "px-4 py-3 text-sm text-slate-200 " +
                        (idx < compareRows.length - 1
                          ? "border-b border-[#c87b3e]/10"
                          : "")
                      }
                    >
                      {row.label}
                    </td>
                    <td
                      className={
                        "bg-[#c87b3e]/8 px-4 py-3 text-center " +
                        (idx < compareRows.length - 1
                          ? "border-b border-[#c87b3e]/20"
                          : "")
                      }
                    >
                      <Cell value={row.roofcrm} />
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-center " +
                        (idx < compareRows.length - 1
                          ? "border-b border-[#c87b3e]/10"
                          : "")
                      }
                    >
                      <Cell value={row.proroof} />
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-center " +
                        (idx < compareRows.length - 1
                          ? "border-b border-[#c87b3e]/10"
                          : "")
                      }
                    >
                      <Cell value={row.roofr} />
                    </td>
                    <td
                      className={
                        "px-4 py-3 text-center " +
                        (idx < compareRows.length - 1
                          ? "border-b border-[#c87b3e]/10"
                          : "")
                      }
                    >
                      <Cell value={row.jobnimbus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SLOT */}
      <section className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <div
          className="rounded-2xl border border-dashed p-10 text-center"
          style={{ borderColor: "rgba(200,123,62,0.3)" }}
        >
          <p
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "#e0975a" }}
          >
            Reserved
          </p>
          <p className="mt-3 text-lg italic brand-muted">
            &ldquo;Customer testimonials coming once first pilot lands.&rdquo;
          </p>
          <p className="mt-2 text-sm brand-faint">
            Want to be the first? We&apos;re onboarding three TX roofing
            companies for the closed beta.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <RoofCrmInterestForm />
          </div>
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section
        className="border-t bg-[#0d1117]"
        style={{ borderColor: "rgba(200,123,62,0.18)" }}
      >
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm brand-muted">
          Part of the{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="hover:underline"
            style={{ color: "#e0975a" }}
          >
            ecbtx.com data portfolio
          </a>
          . See the full lineup at{" "}
          <a
            href="https://portfolio.ecbtx.com"
            className="hover:underline"
            style={{ color: "#e0975a" }}
          >
            portfolio.ecbtx.com
          </a>
          . Hail leads &amp; storm-event API: visit{" "}
          <a
            href="https://storms.ecbtx.com"
            className="hover:underline"
            style={{ color: "#e0975a" }}
          >
            storms.ecbtx.com
          </a>
          .
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  value,
  copper = false,
}: {
  label: string;
  value: string;
  copper?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#c87b3e]/8 pb-2 last:border-b-0">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span
        className={copper ? "font-semibold" : ""}
        style={copper ? { color: "#e0975a" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
