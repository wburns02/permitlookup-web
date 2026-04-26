import { Suspense } from "react";
import { HealthDashboard } from "./health-client";

export const dynamic = "force-dynamic";

export default function HealthPage() {
  return (
    <Suspense fallback={<HealthLoading />}>
      <HealthDashboard />
    </Suspense>
  );
}

function HealthLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
      <div className="h-10 w-64 animate-pulse rounded-md bg-slate-200" />
      <div className="mt-4 h-4 w-96 animate-pulse rounded-md bg-slate-100" />
    </div>
  );
}
