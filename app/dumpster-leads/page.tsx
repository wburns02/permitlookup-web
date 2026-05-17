import { Suspense } from "react";
import { HailLeadsGate } from "@/components/hail-leads-gate";
import { DumpsterLeadsDashboard } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default function DumpsterLeadsPage() {
  return (
    <div data-theme="dumpster" className="theme-shell min-h-full">
      {/* Construction-tape stripe above the dashboard — sets the tone */}
      <div className="tape-stripe" aria-hidden />
      <div className="hero-dumpster">
        <HailLeadsGate>
          <Suspense fallback={<DashboardLoading />}>
            <DumpsterLeadsDashboard />
          </Suspense>
        </HailLeadsGate>
      </div>
      <div className="tape-stripe-thin" aria-hidden />
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="h-10 w-64 animate-pulse rounded-md bg-yellow-400/15" />
      <div className="mt-4 h-4 w-96 animate-pulse rounded-md bg-yellow-400/10" />
    </div>
  );
}
