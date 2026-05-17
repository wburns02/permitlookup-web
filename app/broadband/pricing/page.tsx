import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SubscribeButton } from "./subscribe-button";

export const metadata: Metadata = {
  title: "Broadband API Pricing · 924M FCC records",
  description:
    "Three tiers. Free for prototyping, Pro for production, Enterprise for volume. Same 924M-record dataset on every tier.",
};

export const dynamic = "force-static";

type Tier = {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  bullets: string[];
  cta: { label: string; kind: "free" | "subscribe" | "mailto"; href?: string };
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    tagline: "No card. Email sign-up.",
    bullets: [
      "100 lookups / day",
      "Same data as paid tiers",
      "/v1/broadband/lookup only",
      "API key emailed instantly",
      "Community support",
    ],
    cta: {
      label: "Get free key",
      kind: "mailto",
      href: "mailto:contact@permitlookup.com?subject=Broadband%20Free%20key%20request&body=Company%3A%20%0AUse%20case%3A%20%0A",
    },
  },
  {
    name: "Pro",
    price: "$49",
    cadence: "/mo",
    tagline: "Production keys",
    bullets: [
      "10,000 lookups / month",
      "All 3 endpoints (broadband, septic-score, rural-leads)",
      "API key + usage dashboard",
      "Email support, 1 business day",
      "Cancel any time",
    ],
    featured: true,
    cta: { label: "Subscribe", kind: "subscribe" },
  },
  {
    name: "Enterprise",
    price: "$499",
    cadence: "/mo",
    tagline: "Volume + SLA",
    bullets: [
      "100,000 lookups / month",
      "Bulk CSV exports + warehouse sync",
      "Custom score weights",
      "Dedicated account manager",
      "Annual contracts, custom pricing above 100K",
    ],
    cta: {
      label: "Contact sales",
      kind: "mailto",
      href: "mailto:contact@permitlookup.com?subject=Broadband%20Enterprise%20plan&body=Company%3A%20%0AExpected%20monthly%20volume%3A%20%0A",
    },
  },
];

export default function BroadbandPricingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-sky-50 via-slate-50 to-slate-50"
        />
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-20 md:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-sky-700">
            Pricing
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-6xl">
            Pay for what you use.
            <br className="hidden sm:block" />
            <span className="text-sky-600"> Free to start.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Three tiers. Same 924M-record FCC BDC dataset on every one. Upgrade
            when your traffic does &mdash; cancel any time, no annual lock-in
            until Enterprise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                "flex flex-col rounded-xl border bg-white p-8 shadow-sm transition " +
                (tier.featured
                  ? "border-sky-500 ring-1 ring-sky-500"
                  : "border-slate-200")
              }
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {tier.name}
                </h2>
                {tier.featured && (
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                    Most popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-slate-900">
                  {tier.price}
                </span>
                <span className="text-sm text-slate-500">{tier.cadence}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{tier.tagline}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {tier.cta.kind === "subscribe" ? (
                  <SubscribeButton
                    label={tier.cta.label}
                    featured={tier.featured}
                  />
                ) : (
                  <Link
                    href={tier.cta.href ?? "#"}
                    className={
                      "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition " +
                      (tier.featured
                        ? "bg-sky-600 text-white hover:bg-sky-500"
                        : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50")
                    }
                  >
                    {tier.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Common questions.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Faq
              q="How does the free tier work?"
              a="Sign up with your email, we issue an API key, you get 100 lookups per day. No card required, ever. If you hit the cap, requests return 429 until the next day."
            />
            <Faq
              q="What's billed on Pro?"
              a="$49 flat per month for up to 10,000 lookups across all three endpoints. Stripe handles the subscription. Cancel inside your portal, anytime."
            />
            <Faq
              q="Can I exceed Pro's 10K cap?"
              a="Hard cap on Pro — overage requests return 429 with a 'plan_limit' reason. Upgrade to Enterprise for higher caps or custom metering."
            />
            <Faq
              q="What does Enterprise include?"
              a="100K lookups / month baseline, bulk CSV exports of rural-leads, warehouse sync, custom score-weight tuning, dedicated account manager, SLA. Annual contracts."
            />
            <Faq
              q="Do you store our requests?"
              a="We log address + endpoint + timestamp for billing + abuse prevention. We do not sell or share request logs. Logs auto-purge after 90 days on Free/Pro."
            />
            <Faq
              q="What's your refund policy?"
              a="Pro: cancel any time, prorated. Enterprise: terms in contract. Free: no money, no refund."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-500">
          Back to{" "}
          <Link
            href="/broadband"
            className="text-sky-600 hover:text-sky-500"
          >
            /broadband
          </Link>{" "}
          &middot; manage your keys at{" "}
          <Link
            href="/broadband/portal"
            className="text-sky-600 hover:text-sky-500"
          >
            /broadband/portal
          </Link>
        </div>
      </section>
    </>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{a}</p>
    </div>
  );
}
