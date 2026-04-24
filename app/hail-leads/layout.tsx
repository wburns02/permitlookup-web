import type { Metadata } from "next";
import { HailLeadsGate } from "@/components/hail-leads-gate";

export const metadata: Metadata = {
  title: "Hail Leads · PermitLookup",
  description: "Password-gated demo dashboard for Texas hail × permit leads.",
};

export default function HailLeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HailLeadsGate>{children}</HailLeadsGate>;
}
