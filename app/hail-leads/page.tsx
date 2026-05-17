import { Suspense } from "react";
import { HailLeadsGate } from "@/components/hail-leads-gate";
import { HailLeadsDashboard } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default function HailLeadsPage() {
  return (
    <div data-theme="hail" className="theme-shell hero-hail min-h-full">
      <HailLeadsGate>
        <Suspense fallback={<DashboardLoading />}>
          <HailLeadsDashboard />
        </Suspense>
      </HailLeadsGate>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="h-10 w-64 animate-pulse rounded-md bg-sky-300/10" />
      <div className="mt-4 h-4 w-96 animate-pulse rounded-md bg-sky-300/5" />
    </div>
  );
}
