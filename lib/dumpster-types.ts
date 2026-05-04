/**
 * Dumpster-leads types. Shape comes from the R730 cache JSON published at
 *   <upstream>/dumpster_stats.json
 *   <upstream>/dumpster_default_leads.json
 *
 * MGO is the underlying permit source for East Baton Rouge — sparse data
 * (valuation always null, permit_type usually empty) so the UI hides those
 * columns until backfill lands. `category` and `description` are populated.
 */

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export type DumpsterStats = {
  metro: string;
  total_leads_30d: number;
  total_leads_90d: number;
  high_value_count_30d: number;
  top_permit_type_30d: string | null;
  top_permit_type_count_30d: number;
  average_valuation_30d: number;
  median_valuation_30d: number;
  fresh_leads_this_week: number;
  latest_permit_date: string | null;
};

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export type DumpsterCategory =
  | "reroof"
  | "roof_other"
  | "demolition"
  | "new_construction"
  | "addition"
  | "remodel"
  | "pool"
  | "other";

export type DumpsterSortKey = "newest" | "oldest";

export type DumpsterLead = {
  lead_id: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  county: string | null;
  permit_type: string | null;
  work_class: string | null;
  description: string | null;
  issue_date: string | null;
  applied_date: string | null;
  effective_date: string | null;
  days_since_issue: number | null;
  valuation: number | null;
  contractor_company: string | null;
  contractor_phone: string | null;
  contractor_email: string | null;
  contractor_license_number: string | null;
  contractor_license_status: string | null;
  contractor_license_expires: string | null;
  owner_name: string | null;
  category: DumpsterCategory | string;
  source: string;
};

export type DumpsterLeadsResponse = {
  metro?: string;
  results: DumpsterLead[];
};

export type DumpsterFilters = {
  cityZip?: string; // free text, substring match
  categories?: string[]; // multi-select
  fromDate?: string; // YYYY-MM-DD
  toDate?: string;
  minDaysSinceIssue?: number;
  sort?: DumpsterSortKey;
};
