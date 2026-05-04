import type { Metadata } from "next";
import { HailLeadsGate } from "@/components/hail-leads-gate";

export const metadata: Metadata = {
  title: "Dumpster Leads · PermitLookup",
  description:
    "Password-gated demo dashboard for Baton Rouge dumpster-rental leads pulled from local construction permits.",
};

export default function DumpsterLeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HailLeadsGate>{children}</HailLeadsGate>;
}
