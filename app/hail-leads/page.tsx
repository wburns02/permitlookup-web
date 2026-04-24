import { Skeleton } from "@/components/ui/skeleton";
import { Construction } from "lucide-react";

export default function HailLeadsDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-amber-700">
          <Construction className="h-3.5 w-3.5" />
          Work in progress
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Hail Leads Dashboard
        </h1>
        <p className="max-w-2xl text-slate-600">
          Dashboard coming next. Filters, an exportable table, and live permit
          matches ship in the follow-up task.
        </p>
      </div>

      {/* Faux dashboard skeleton to communicate what will live here */}
      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-4 h-8 w-28" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 items-center gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
            >
              <Skeleton className="col-span-2 h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
