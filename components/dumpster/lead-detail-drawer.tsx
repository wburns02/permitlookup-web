"use client";

import {
  BadgeCheck,
  Calendar,
  ExternalLink,
  Hammer,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { DumpsterLead } from "@/lib/dumpster-types";
import { CategoryBadge, LeadGradePill } from "./leads-table";

type Props = {
  lead: DumpsterLead | null;
  onClose: () => void;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDaysAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}

function formatPhone(n: string | null): string {
  if (!n) return "";
  const digits = n.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return n;
}

function mapsUrl(lead: DumpsterLead): string | null {
  const parts = [lead.address, lead.city].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  const q = encodeURIComponent(parts.join(" "));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function DumpsterLeadDrawer({ lead, onClose }: Props) {
  const open = lead !== null;

  return (
    <Sheet
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      <SheetContent side="right" className="w-full bg-white sm:!max-w-2xl">
        {lead && <DrawerBody lead={lead} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({ lead }: { lead: DumpsterLead }) {
  const cityLine = [lead.city, lead.zip].filter(Boolean).join(", ");
  const maps = mapsUrl(lead);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SheetHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 pt-6 pb-4 backdrop-blur">
        <SheetTitle className="text-xl font-semibold text-slate-900">
          {lead.address ?? "Unknown address"}
        </SheetTitle>
        <SheetDescription className="text-slate-500">
          {cityLine || "—"}
          {lead.county ? ` · ${lead.county} Co.` : ""}
        </SheetDescription>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CategoryBadge value={lead.category} />
          {maps && (
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <MapPin className="h-3.5 w-3.5" />
              Open in Maps
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          )}
        </div>
      </SheetHeader>

      <div className="flex flex-col gap-5 p-6">
        {/* Lead quality (grade + score) — only when populated */}
        {lead.lead_grade && (
          <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Lead quality
            </div>
            <div className="mt-3 flex items-center gap-4">
              <LeadGradePill grade={lead.lead_grade} size="lg" />
              <div className="flex flex-col">
                <div className="text-sm text-slate-500">
                  {lead.lead_score != null
                    ? `score ${lead.lead_score} / 100`
                    : "score unavailable"}
                </div>
                <div className="text-xs text-slate-400">
                  Higher grades get priority outreach.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Permit section */}
        <Section
          icon={<Hammer className="h-4 w-4" />}
          title="Permit"
          accent="from-indigo-50 to-white"
        >
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Issued
                </div>
                <div className="mt-0.5 text-slate-900">
                  <span className="font-medium">
                    {fmtDate(lead.issue_date)}
                  </span>
                  {lead.issue_date && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {fmtDaysAgo(lead.issue_date)}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Applied
                </div>
                <div className="mt-0.5 text-slate-900">
                  <span className="font-medium">
                    {fmtDate(lead.applied_date)}
                  </span>
                  {lead.applied_date && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {fmtDaysAgo(lead.applied_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {lead.description && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                {lead.description}
              </div>
            )}
            {(lead.permit_type || lead.work_class) && (
              <div className="text-xs text-slate-600">
                {lead.permit_type ?? "—"}
                {lead.work_class ? ` · ${lead.work_class}` : ""}
              </div>
            )}
          </div>
        </Section>

        {/* Contractor section */}
        <ContractorSection lead={lead} />

        {/* Owner section */}
        <Section
          icon={<User className="h-4 w-4" />}
          title="Owner"
          accent="from-slate-50 to-white"
        >
          <KV label="Owner" value={lead.owner_name ?? "—"} />
        </Section>

        {/* Source */}
        <Section
          icon={<Calendar className="h-4 w-4" />}
          title="Source"
          accent="from-slate-50 to-white"
        >
          <div className="text-sm text-slate-600">
            Pulled from{" "}
            <span className="font-medium text-slate-900">
              {lead.source || "—"}
            </span>
          </div>
        </Section>
      </div>
    </div>
  );
}

function ContractorSection({ lead }: { lead: DumpsterLead }) {
  const hasAny =
    lead.contractor_company ||
    lead.contractor_phone ||
    lead.contractor_email ||
    lead.contractor_license_number;

  if (!hasAny) {
    return (
      <Section
        icon={<Hammer className="h-4 w-4" />}
        title="Contractor"
        accent="from-slate-50 to-white"
      >
        <div className="text-sm text-slate-500">No contractor on file</div>
      </Section>
    );
  }

  const phoneDigits = lead.contractor_phone?.replace(/\D/g, "") ?? "";
  const status = lead.contractor_license_status;
  const statusPillClass =
    status === "Active"
      ? "bg-emerald-100 text-emerald-800"
      : status === "Expired"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-700";

  return (
    <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50/40 to-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Contractor</h3>
      <div className="mt-4 flex flex-col gap-3">
        {lead.contractor_company && (
          <Row label="Company">
            <span className="text-sm font-medium text-slate-900">
              {lead.contractor_company}
            </span>
          </Row>
        )}

        {lead.contractor_phone && (
          <Row label="Phone">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`tel:${phoneDigits}`}
                className="text-base font-semibold text-indigo-700 hover:text-indigo-600"
              >
                {formatPhone(lead.contractor_phone)}
              </a>
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
            </div>
          </Row>
        )}

        {lead.contractor_email && (
          <Row label="Email">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${lead.contractor_email}`}
                className="break-all text-sm font-medium text-indigo-700 hover:text-indigo-600"
              >
                {lead.contractor_email}
              </a>
              <a
                href={`mailto:${lead.contractor_email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            </div>
          </Row>
        )}

        {lead.contractor_license_number && (
          <Row label="License">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {lead.contractor_license_number}
              </span>
              {status && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    statusPillClass,
                  )}
                >
                  {status === "Active" && <BadgeCheck className="h-3 w-3" />}
                  {status}
                </span>
              )}
              {lead.contractor_license_expires && (
                <span className="text-xs text-slate-500">
                  Expires {fmtDate(lead.contractor_license_expires)}
                </span>
              )}
            </div>
          </Row>
        )}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[120px_1fr] sm:items-center sm:gap-4">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        accent && `bg-gradient-to-br ${accent}`,
      )}
    >
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200">
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-0.5 text-sm text-slate-900">{value}</div>
    </div>
  );
}
