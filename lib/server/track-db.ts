/**
 * Server-side helpers for the dumpster events ingest pipeline.
 *
 * Why no direct Postgres client: T430 Postgres is on Tailscale CGNAT and
 * unreachable from Vercel's runtime. R730 (which IS on Tailscale) exposes
 * `POST /events/ingest` over Tailscale Funnel; this Vercel route forwards
 * to that receiver, which writes to Postgres locally over the tailnet.
 *
 * Same pattern we use for the dashboard cache (see
 * `app/api/dashboard-cache/[file]/route.ts`).
 */

const UUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const MAX_EVENT_TYPE = 64;
const MAX_TEXT = 500;
const MAX_PATH = 500;
const MAX_PAYLOAD_BYTES = 8 * 1024;
const SESSION_COOKIE = "dumpster_sid";
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const EVENTS_UPSTREAM =
  process.env.EVENTS_UPSTREAM ??
  "https://soc-api.tailad2d5f.ts.net/events/ingest";

export interface NormalizedEvent {
  session_id: string;
  visitor_id: string | null;
  event_type: string;
  event_payload: Record<string, unknown> | null;
  path: string | null;
  referrer: string | null;
  user_agent: string | null;
  viewport_width: number | null;
  ip: string | null;
  geo_city: string | null;
  geo_region: string | null;
  geo_country: string | null;
}

export function stripControl(raw: string, maxLen: number): string | null {
  const trimmed = raw.replace(CONTROL_CHAR_RE, "").trim();
  if (!trimmed) return null;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

export function cleanText(value: unknown, maxLen = MAX_TEXT): string | null {
  if (typeof value !== "string") return null;
  return stripControl(value, maxLen);
}

export function cleanUuid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return UUID_RE.test(v) ? v : null;
}

export function cleanInt(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  if (!Number.isInteger(value)) return Math.trunc(value);
  return value;
}

export function cleanEventType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = stripControl(value, MAX_EVENT_TYPE);
  return v && v.length > 0 ? v : null;
}

export function cleanPayload(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value !== "object" || Array.isArray(value)) return null;
  // Cap serialized size so a hostile client can't bloat the row.
  try {
    const json = JSON.stringify(value);
    if (Buffer.byteLength(json, "utf8") > MAX_PAYLOAD_BYTES) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function uuidV4(): string {
  // crypto.randomUUID is available on Node 20+ / Edge / modern Vercel runtime.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback to a manual v4 in case the runtime is older.
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

export function readSessionCookie(req: Request): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  // Cheap parse — we only care about one specific cookie.
  for (const part of header.split(";")) {
    const [rawName, ...rest] = part.split("=");
    if (!rawName) continue;
    if (rawName.trim() === SESSION_COOKIE) {
      const v = rest.join("=").trim();
      return cleanUuid(v);
    }
  }
  return null;
}

export function buildSessionCookie(value: string): string {
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${SESSION_COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax; Secure`;
}

export interface ServerCapture {
  ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  geo_city: string | null;
  geo_region: string | null;
  geo_country: string | null;
}

export function captureFromRequest(req: Request): ServerCapture {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  let ip: string | null = null;
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) ip = stripControl(first, 64);
  }
  const ua = h.get("user-agent");
  const ref = h.get("referer");
  // Vercel URL-encodes geo headers (e.g. "San%20Marcos"). Decode so the
  // row holds plain text; fall through if the value isn't well-formed.
  const decode = (raw: string | null, max = 128): string | null => {
    if (!raw) return null;
    let v = raw;
    try {
      v = decodeURIComponent(raw);
    } catch {
      /* keep the raw value if it has malformed % escapes */
    }
    return cleanText(v, max);
  };
  return {
    ip,
    user_agent: ua ? stripControl(ua, MAX_TEXT) : null,
    referrer: ref ? stripControl(ref, MAX_TEXT) : null,
    geo_city: decode(h.get("x-vercel-ip-city")),
    geo_region: decode(h.get("x-vercel-ip-country-region")),
    geo_country: decode(h.get("x-vercel-ip-country"), 8),
  };
}

/**
 * Normalize the client-supplied body + server-captured fields into the
 * row shape the R730 receiver expects. Returns null if `event_type` is
 * missing or invalid (the route maps this to a 204 with no upstream call).
 */
export function buildEvent(args: {
  body: unknown;
  sessionId: string;
  capture: ServerCapture;
}): NormalizedEvent | null {
  const body =
    args.body && typeof args.body === "object" && !Array.isArray(args.body)
      ? (args.body as Record<string, unknown>)
      : {};

  const event_type = cleanEventType(body.event_type);
  if (!event_type) return null;

  return {
    session_id: args.sessionId,
    visitor_id: cleanUuid(body.visitor_id),
    event_type,
    event_payload: cleanPayload(body.payload),
    path: cleanText(body.path, MAX_PATH),
    referrer: args.capture.referrer ?? cleanText(body.referrer, MAX_TEXT),
    user_agent: args.capture.user_agent,
    viewport_width: cleanInt(body.viewport_width),
    ip: args.capture.ip,
    geo_city: args.capture.geo_city,
    geo_region: args.capture.geo_region,
    geo_country: args.capture.geo_country,
  };
}

/**
 * Forward a normalized event to the R730 receiver with a tight 1s timeout.
 * Returns true if the upstream answered 2xx, false on any failure. The
 * caller MUST always 204 the user regardless — best-effort tracking.
 */
export async function forwardEvent(event: NormalizedEvent): Promise<boolean> {
  try {
    const res = await fetch(EVENTS_UPSTREAM, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(1_000),
      // No edge cache for ingestion.
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
