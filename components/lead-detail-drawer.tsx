"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CloudRain,
  Hammer,
  Home,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getHailLeadDetail } from "@/lib/api";
import type { HailLeadDetail, HailLeadPhone } from "@/lib/types";

type Props = {
  leadId: string | null;
  onClose: () => void;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: HailLeadDetail }
  | { status: "error"; message: string };

export function LeadDetailDrawer({ leadId, onClose }: Props) {
  const [state, setState] = useState<State>({ status: "idle" });
  const open = leadId !== null;

  useEffect(() => {
    if (!leadId) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    let cancelled = false;
    getHailLeadDetail(leadId)
      .then((data) => {
        if (!cancelled) setState({ status: "ok", data });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({
            status: "error",
            message: err.message || "Failed to load lead",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full bg-white sm:!max-w-2xl"
      >
        {state.status === "loading" && <DrawerSkeleton />}
        {state.status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div className="text-base font-medium text-slate-900">
              Couldn&apos;t load this lead
            </div>
            <div className="max-w-sm text-sm text-slate-500">
              {state.message}
            </div>
          </div>
        )}
        {state.status === "ok" && <DrawerBody lead={state.data} />}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      <div>
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function fmtUsd(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtInt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

const CATEGORY_COLORS: Record<string, string> = {
  roof_replace: "bg-emerald-100 text-emerald-800",
  siding: "bg-sky-100 text-sky-800",
  gutter: "bg-violet-100 text-violet-800",
  solar: "bg-amber-100 text-amber-800",
};

function CategoryBadge({ value }: { value: string | null | undefined }) {
  if (!value) return <Badge variant="secondary">—</Badge>;
  const label = value.replace(/_/g, " ");
  const cls = CATEGORY_COLORS[value] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        cls,
      )}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Drawer body
// ---------------------------------------------------------------------------

function DrawerBody({ lead }: { lead: HailLeadDetail }) {
  const cityLine = [lead.city, lead.zip].filter(Boolean).join(", ");
  const hail = lead.storm.hail_size_inches ?? 0;
  // Max visual scale ~3"
  const hailPct = Math.min(100, Math.round((hail / 3) * 100));
  const hailSeverityColor =
    hail >= 2 ? "bg-red-500" : hail >= 1.25 ? "bg-amber-500" : "bg-sky-500";

  const daysAfter = lead.permit.days_after_storm;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <SheetHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 pt-6 pb-4 backdrop-blur">
        <SheetTitle className="text-xl font-semibold text-slate-900">
          {lead.address ?? "Unknown address"}
        </SheetTitle>
        <SheetDescription className="text-slate-500">
          {cityLine || "—"}{lead.county ? ` · ${lead.county} Co.` : ""}
        </SheetDescription>
      </SheetHeader>

      <div className="flex flex-col gap-5 p-6">
        {/* Storm section */}
        <Section
          icon={<CloudRain className="h-4 w-4" />}
          title="Storm hit"
          accent="from-sky-50 to-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-slate-900">
                <span className="font-medium">
                  {lead.storm.storm_type ?? "Hail"}
                </span>{" "}
                on {fmtDate(lead.storm.storm_date)}{" "}
                <span className="text-slate-500">
                  ({fmtDaysAgo(lead.storm.storm_date)})
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Hail size:{" "}
                <span className="font-medium text-slate-900">
                  {hail ? `${hail.toFixed(2)}"` : "unknown"}
                </span>{" "}
                diameter
              </div>
            </div>
            {lead.storm.storm_event_id && (
              <a
                href={`https://www.ncdc.noaa.gov/stormevents/eventdetails.jsp?id=${lead.storm.storm_event_id}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                NOAA event ↗
              </a>
            )}
          </div>
          {/* Severity bar */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <span>Severity</span>
              <span>3&quot; scale</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full transition-all", hailSeverityColor)}
                style={{ width: `${hailPct}%` }}
              />
            </div>
          </div>
          {lead.storm.damage_report && (
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {lead.storm.damage_report}
            </p>
          )}
        </Section>

        {/* Permit section */}
        <Section
          icon={<Hammer className="h-4 w-4" />}
          title="Permit pulled"
          accent="from-indigo-50 to-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-slate-900">
                <span className="font-medium">
                  {fmtDate(lead.permit.permit_date)}
                </span>
                {daysAfter != null && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {daysAfter} days after storm
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                {lead.permit.permit_type ?? "—"}
                {lead.permit.work_class ? ` · ${lead.permit.work_class}` : ""}
              </div>
            </div>
            <CategoryBadge value={lead.permit.lead_category} />
          </div>
          {lead.permit.description && (
            <div className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {lead.permit.description}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <KV label="Contractor" value={lead.permit.contractor ?? "—"} />
            <KV
              label="Valuation"
              value={
                lead.permit.valuation != null
                  ? fmtUsd(lead.permit.valuation)
                  : "—"
              }
            />
            {lead.permit.permit_number && (
              <KV label="Permit #" value={lead.permit.permit_number} />
            )}
          </div>
        </Section>

        {/* Address history */}
        <AddressHistorySection lead={lead} />

        {/* Property section */}
        <Section
          icon={<Home className="h-4 w-4" />}
          title="Property data"
          accent="from-emerald-50 to-white"
        >
          <div className="grid grid-cols-3 gap-3 text-sm">
            <KV label="Year built" value={fmtInt(lead.year_built)} />
            <KV
              label="Living area"
              value={
                lead.living_area_sqft
                  ? `${lead.living_area_sqft.toLocaleString()} sqft`
                  : "—"
              }
            />
            <KV
              label="Appraised"
              value={fmtUsd(lead.appraised_value)}
            />
          </div>
        </Section>

        {/* Owner section */}
        <OwnerSection lead={lead} />
      </div>
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

function AddressHistorySection({ lead }: { lead: HailLeadDetail }) {
  const h = lead.address_history;
  const [open, setOpen] = useState(true);
  const lastRoof = h.last_roof_permit_date;
  const lastRoofYear = lastRoof ? new Date(lastRoof).getFullYear() : null;
  const ageYears = lastRoofYear
    ? new Date().getFullYear() - lastRoofYear
    : null;
  const earliestYear = h.earliest_permit_date
    ? new Date(h.earliest_permit_date).getFullYear()
    : null;

  return (
    <Section
      icon={<Calendar className="h-4 w-4" />}
      title="Address history"
      accent="from-slate-50 to-white"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          <span className="font-medium text-slate-900">
            {fmtInt(h.total_permits)}
          </span>{" "}
          permits on file
          {h.prior_roof_permits > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
              <ShieldAlert className="h-3 w-3" /> {h.prior_roof_permits} prior
              roof
              {h.prior_roof_permits === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
        >
          {open ? (
            <>
              Hide <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show details <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      </div>
      {open && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <KV
            label="Earliest permit"
            value={earliestYear ?? "—"}
          />
          <KV
            label="Last roof"
            value={
              lastRoofYear ? (
                <>
                  {lastRoofYear}
                  {ageYears !== null && (
                    <span className="ml-1 text-xs text-slate-500">
                      ({ageYears}y ago)
                    </span>
                  )}
                </>
              ) : (
                "—"
              )
            }
          />
          <KV
            label="Roof $ spent"
            value={fmtUsd(h.total_roof_valuation)}
          />
          <KV
            label="Prior roofs"
            value={fmtInt(h.prior_roof_permits)}
          />
        </div>
      )}
    </Section>
  );
}

function OwnerSection({ lead }: { lead: HailLeadDetail }) {
  const owner = lead.owner;
  const [phonesOpen, setPhonesOpen] = useState(false);

  if (!owner || !owner.enriched) {
    return (
      <Section
        icon={<User className="h-4 w-4" />}
        title="Owner"
        accent="from-slate-50 to-white"
      >
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <User className="h-4 w-4 text-slate-400" />
          </div>
          <div>
            Owner data not yet enriched.
            <div className="text-xs text-slate-400">
              Run skip-trace to pull name, phones, and email.
            </div>
          </div>
        </div>
      </Section>
    );
  }

  const topPhones = owner.phones.slice(0, 3);
  const restPhones = owner.phones.slice(3);

  return (
    <Section
      icon={<User className="h-4 w-4" />}
      title="Owner"
      accent="from-indigo-50 to-white"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200">
          <User className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-medium text-slate-900">
            {owner.owner_name ?? "Unknown owner"}
          </div>
          {owner.mailing_address && (
            <div className="text-xs text-slate-500">
              <MapPin className="mr-1 inline h-3 w-3" />
              {owner.mailing_address}
            </div>
          )}
        </div>
      </div>

      {owner.phones.length > 0 && (
        <div className="mt-4 space-y-2">
          {topPhones.map((p, i) => (
            <PhoneRow key={i} phone={p} />
          ))}
          {restPhones.length > 0 && (
            <>
              {phonesOpen &&
                restPhones.map((p, i) => (
                  <PhoneRow key={`rest-${i}`} phone={p} />
                ))}
              <button
                type="button"
                onClick={() => setPhonesOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                {phonesOpen ? "Hide" : `Show ${restPhones.length} more`}
                {phonesOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </>
          )}
        </div>
      )}

      {owner.emails.length > 0 && (
        <div className="mt-4 space-y-2">
          {owner.emails.map((e, i) => (
            <EmailRow key={i} email={e} />
          ))}
        </div>
      )}

      {owner.phones.length === 0 && owner.emails.length === 0 && (
        <div className="mt-4 text-sm text-slate-500">
          Enrichment ran but returned no contact points.
        </div>
      )}
    </Section>
  );
}

function PhoneRow({ phone }: { phone: HailLeadPhone }) {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          <Phone className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">
            {formatPhone(phone.number)}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
            {phone.type && <span>{phone.type}</span>}
            {phone.score != null && (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                score {phone.score}
              </span>
            )}
            {phone.dnc && (
              <span className="inline-flex items-center gap-1 text-red-600">
                <ShieldAlert className="h-3 w-3" /> DNC
              </span>
            )}
          </div>
        </div>
      </div>
      <CopyButton value={phone.number} />
    </div>
  );
}

function EmailRow({ email }: { email: string }) {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          <Mail className="h-3.5 w-3.5" />
        </div>
        <div className="text-sm text-slate-900">{email}</div>
      </div>
      <CopyButton value={email} />
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          /* ignore */
        }
      }}
      aria-label={`Copy ${value}`}
      className="text-slate-400 hover:text-slate-700"
    >
      {copied ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function formatPhone(n: string): string {
  const digits = n.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return n;
}
