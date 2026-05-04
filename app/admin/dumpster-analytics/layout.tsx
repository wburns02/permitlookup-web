import type { Metadata } from "next";
import { HailLeadsGate } from "@/components/hail-leads-gate";

export const metadata: Metadata = {
  title: "Dumpster Analytics · Admin",
  description: "Internal traffic + interaction analytics for the dumpster-leads dashboard.",
};

/**
 * Admin layout for the dumpster analytics dashboard. Re-uses HailLeadsGate
 * for now so a single demo unlock is enough to view it.
 *
 * TODO: swap to a proper admin gate (separate password or role check) when
 * ready — for the partner-roofer demo phase the demo password is fine.
 *
 * Tracking note: the T2 client-side tracker should be scoped to /dumpster-leads
 * only and must NOT fire on /admin/* — otherwise the analytics dashboard would
 * generate its own events and create a feedback loop. If we ever instrument
 * /admin/dumpster-analytics directly, exclude it from the rollup queries.
 */
export default function DumpsterAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HailLeadsGate>{children}</HailLeadsGate>;
}
