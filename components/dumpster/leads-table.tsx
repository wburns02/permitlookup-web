"use client";

import { BadgeCheck, ChevronRight, Inbox, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DumpsterLead } from "@/lib/dumpster-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtRelative(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function fmtAbsolute(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(s: string | null, n: number): string {
  if (!s) return "—";
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

const CATEGORY_COLORS: Record<string, string> = {
  reroof: "bg-amber-100 text-amber-800",
  roof_other: "bg-amber-50 text-amber-700",
  demolition: "bg-red-100 text-red-800",
  remodel: "bg-indigo-100 text-indigo-800",
  new_construction: "bg-emerald-100 text-emerald-800",
  addition: "bg-violet-100 text-violet-800",
  pool: "bg-cyan-100 text-cyan-800",
  other: "bg-slate-100 text-slate-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  reroof: "Reroof",
  roof_other: "Roof other",
  demolition: "Demolition",
  new_construction: "New construction",
  addition: "Addition",
  remodel: "Remodel",
  pool: "Pool",
  other: "Other",
};

export function CategoryBadge({ value }: { value: string | null }) {
  if (!value) return <Badge variant="secondary">—</Badge>;
  const cls = CATEGORY_COLORS[value] ?? "bg-slate-100 text-slate-700";
  const label = CATEGORY_LABELS[value] ?? value.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
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

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

type Props = {
  leads: DumpsterLead[];
  loading: boolean;
  onSelect: (lead: DumpsterLead) => void;
};

export function DumpsterLeadsTable({ leads, loading, onSelect }: Props) {
  if (loading) return <TableSkeleton />;

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Inbox className="h-6 w-6" />
        </div>
        <div className="text-base font-medium text-slate-900">
          No leads match these filters.
        </div>
        <div className="mt-1 text-sm text-slate-500">
          Try widening the date range or removing a category.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 hover:bg-slate-50">
              <TableHead className="pl-5">Address</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Issued / Applied</TableHead>
              <TableHead>Contractor</TableHead>
              <TableHead className="pr-5">Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((r) => (
              <DesktopRow
                key={r.lead_id}
                row={r}
                onClick={() => onSelect(r)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <ul className="divide-y divide-slate-100 md:hidden">
        {leads.map((r) => (
          <li key={r.lead_id}>
            <button
              type="button"
              onClick={() => onSelect(r)}
              className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {r.address ?? "Unknown"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <CategoryBadge value={r.category} />
                  <span>·</span>
                  <span>
                    {r.issue_date ? "Issued" : r.applied_date ? "Applied" : "Issued"}{" "}
                    {fmtRelative(
                      r.effective_date ?? r.issue_date ?? r.applied_date,
                    )}
                  </span>
                </div>
                {r.description && (
                  <div className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {r.description}
                  </div>
                )}
                {r.contractor_company && (
                  <div className="mt-1.5 truncate text-xs font-medium text-slate-700">
                    {r.contractor_company}
                  </div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {r.contractor_phone && (
                    <a
                      href={`tel:${r.contractor_phone.replace(/\D/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700"
                    >
                      <Phone className="h-3 w-3" />
                      {formatPhone(r.contractor_phone)}
                    </a>
                  )}
                  {r.contractor_license_status === "Active" &&
                    r.contractor_license_number && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        <BadgeCheck className="h-3 w-3" />
                        Licensed {r.contractor_license_number}
                      </span>
                    )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 pt-1 text-xs font-medium text-indigo-600">
                View <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DesktopRow({
  row,
  onClick,
}: {
  row: DumpsterLead;
  onClick: () => void;
}) {
  const cityLine = [row.city, row.county ? `${row.county} Co.` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer transition-colors duration-150 ease-in-out hover:bg-slate-50"
    >
      <TableCell className="pl-5 font-medium text-slate-900">
        <div className="max-w-[240px] truncate">{row.address ?? "—"}</div>
        {cityLine && (
          <div className="text-[11px] font-normal text-slate-400">
            {cityLine}
          </div>
        )}
      </TableCell>
      <TableCell>
        <CategoryBadge value={row.category} />
      </TableCell>
      <TableCell>
        <div
          className="max-w-[280px] truncate text-sm text-slate-700"
          title={row.description ?? undefined}
        >
          {truncate(row.description, 60)}
        </div>
      </TableCell>
      <TableCell>
        {(() => {
          const dateIso =
            row.effective_date ?? row.issue_date ?? row.applied_date;
          const isApplied = !row.issue_date && !!row.applied_date;
          return (
            <>
              <div className="text-slate-900">
                {fmtAbsolute(dateIso)}
                {isApplied && (
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200/60">
                    applied
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                {fmtRelative(dateIso)}
              </div>
            </>
          );
        })()}
      </TableCell>
      <TableCell>
        <div className="max-w-[200px] truncate text-xs font-medium text-slate-700">
          {row.contractor_company ?? "—"}
        </div>
        {row.contractor_phone && (
          <a
            href={`tel:${row.contractor_phone.replace(/\D/g, "")}`}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
          >
            <Phone className="h-3 w-3" />
            {formatPhone(row.contractor_phone)}
          </a>
        )}
        {row.contractor_license_status === "Active" &&
          row.contractor_license_number && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                <BadgeCheck className="h-3 w-3" />
                Licensed {row.contractor_license_number}
              </span>
            </div>
          )}
      </TableCell>
      <TableCell className="pr-5">
        <span className="text-[11px] text-slate-500">{row.source || "—"}</span>
      </TableCell>
    </TableRow>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-0 divide-y divide-slate-100 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] items-center gap-3 px-3 py-3"
          >
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
