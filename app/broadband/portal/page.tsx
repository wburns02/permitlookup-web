import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";
import { PortalClient } from "./portal-client";

export const metadata: Metadata = {
  title: "My API Keys · Broadband API",
  description: "Manage your Broadband API keys, view usage, and rotate keys.",
};

export const dynamic = "force-dynamic";

/**
 * Portal landing page. Two states:
 *   1. Not signed in   → show magic-link email form (POST to /api/portal/auth)
 *   2. Signed in       → render <PortalClient /> which fetches keys + usage
 *
 * Auth is intentionally minimal: we issue a signed cookie keyed to the email
 * address verified via Stripe Checkout (success_url lands here with a
 * session_id; the client resolves it via /api/portal/session). When the
 * upstream Stripe + provisioning flows are wired up the SignIn block should
 * be replaced with the real magic-link transport.
 *
 * For now this is a scaffold: the data calls return placeholders so the page
 * renders cleanly before Stripe goes live.
 */

export default function BroadbandPortalPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-50"
        />
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-20 md:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
            <KeyRound className="h-3.5 w-3.5" />
            Customer portal
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-slate-900 md:text-5xl">
            Your API keys.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            View your keys, monitor usage against your plan cap, and rotate
            keys when you need to. Sign in with the email you used at checkout.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <PortalClient searchParamsPromise={searchParams} />
      </section>

      {/* Help footer */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Need to change your plan or cancel?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Email contact@permitlookup.com from your billing email and
                  we&apos;ll handle it within one business day.
                </p>
              </div>
            </div>
            <Link
              href="mailto:contact@permitlookup.com?subject=Broadband%20billing"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            >
              Email support
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
