import { HailLeadsGate } from "@/components/hail-leads-gate";

/**
 * Admin section gate. Re-uses the same demo-password gate as /hail-leads
 * so a single unlock unlocks the whole demo.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HailLeadsGate>{children}</HailLeadsGate>;
}
