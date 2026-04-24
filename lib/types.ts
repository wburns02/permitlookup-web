/**
 * Hail-leads API types. Mirrors the Pydantic schemas in
 * permit-api/app/schemas/hail_leads.py. Keep in sync if backend adds fields.
 */

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export type HailLeadsStats = {
  total_leads: number;
  unique_addresses: number;
  counties_covered: number;
  latest_storm_date: string | null; // ISO date (YYYY-MM-DD)
  fresh_leads_this_week: number;
  hail_events_last_year: number;
};

// ---------------------------------------------------------------------------
// List / search
// ---------------------------------------------------------------------------

export type LeadCategory = "roof_replace" | "siding" | "gutter" | "solar";
export type SortKey = "score_desc" | "storm_date_desc" | "issue_date_desc";

export type HailLeadListItem = {
  lead_id: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  county: string | null;
  storm_date: string | null;
  storm_type: string | null;
  hail_size_inches: number | null;
  permit_date: string | null;
  days_after_storm: number | null;
  lead_category: string | null;
  permit_description: string | null;
  competitor_contractor: string | null;
  score: number | null;
  prior_roof_permits: number | null;
  last_roof_permit_date: string | null;
  owner_enriched: boolean;
};

export type HailLeadListResponse = {
  results: HailLeadListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type HailLeadsFilters = {
  county?: string;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;
  category?: LeadCategory;
  min_hail_inches?: number;
  min_days_after?: number;
  max_days_after?: number;
  page?: number;
  page_size?: number;
  sort?: SortKey;
};

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export type HailLeadStorm = {
  storm_date: string | null;
  storm_type: string | null;
  hail_size_inches: number | null;
  storm_event_id: string | null;
  damage_report: string | null;
};

export type HailLeadPermit = {
  permit_date: string | null;
  days_after_storm: number | null;
  permit_number: string | null;
  permit_type: string | null;
  work_class: string | null;
  description: string | null;
  valuation: number | null;
  contractor: string | null;
  lead_category: string | null;
};

export type HailLeadAddressHistory = {
  total_permits: number;
  prior_roof_permits: number;
  earliest_permit_date: string | null;
  latest_permit_date: string | null;
  last_roof_permit_date: string | null;
  total_roof_valuation: number | null;
};

export type HailLeadPhone = {
  number: string;
  type: string | null;
  dnc: boolean | null;
  score: number | null;
};

export type HailLeadOwner = {
  enriched: boolean;
  owner_name: string | null;
  phones: HailLeadPhone[];
  emails: string[];
  mailing_address: string | null;
};

export type HailLeadDetail = {
  lead_id: string;
  address: string | null;
  city: string | null;
  zip: string | null;
  county: string | null;
  lat: number | null;
  lng: number | null;
  storm: HailLeadStorm;
  permit: HailLeadPermit;
  address_history: HailLeadAddressHistory;
  year_built: number | null;
  living_area_sqft: number | null;
  appraised_value: number | null;
  owner: HailLeadOwner | null;
};
