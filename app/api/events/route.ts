/**
 * POST /api/events — best-effort tracking ingest for dumpster-leads.
 *
 * Flow:
 *   browser → /api/events (this route, runs on Vercel)
 *           → https://soc-api.tailad2d5f.ts.net/events/ingest (R730, Tailscale Funnel)
 *           → INSERT INTO dumpster_events on T430 over the tailnet
 *
 * Why the proxy: T430 Postgres lives on Tailscale CGNAT and is unreachable
 * from Vercel's runtime, so we cannot connect a `pg` client directly. R730
 * is on the tailnet and exposes a small Python receiver (port 9092) over
 * Tailscale Funnel, which writes the row locally. Same pattern as
 * `app/api/dashboard-cache/[file]/route.ts`.
 *
 * Contract:
 *  - 405 on anything other than POST.
 *  - Always returns 204 (even on bad bodies / upstream errors). DB insert
 *    failures must not 500 the user. The route logs upstream failures on
 *    R730 — see the events-ingest.service log.
 *  - Sets `dumpster_sid` cookie (HttpOnly; SameSite=Lax; Secure; 30 days)
 *    if the request didn't carry one.
 *  - Captures IP / User-Agent / referrer / Vercel geo headers server-side
 *    so the client never has to send them. The client `lib/track.ts`
 *    deliberately doesn't include these — IP only on the server.
 *  - Tight 1s upstream timeout so the route always responds well under
 *    200ms even if R730 is unhealthy.
 */
import {
  buildEvent,
  buildSessionCookie,
  captureFromRequest,
  forwardEvent,
  readSessionCookie,
  uuidV4,
} from "@/lib/server/track-db";

// Force the Node.js runtime so AbortSignal.timeout, crypto.randomUUID, and
// `Buffer.byteLength` all work the same way in dev and prod. Edge would
// also work, but Node is closer to the dashboard-cache proxy already in
// place and avoids any runtime drift on Funnel-backed forwards.
export const runtime = "nodejs";

// Ingestion is per-request side-effect; never let a CDN cache the response.
export const dynamic = "force-dynamic";

function noContent(setCookie: string | null): Response {
  const headers = new Headers();
  headers.set("cache-control", "no-store");
  if (setCookie) headers.set("set-cookie", setCookie);
  return new Response(null, { status: 204, headers });
}

export async function POST(req: Request): Promise<Response> {
  // 1. Resolve session_id (cookie or new) BEFORE anything that can fail
  //    so we always set a cookie even on bad bodies.
  const existingSid = readSessionCookie(req);
  const sessionId = existingSid ?? uuidV4();
  const setCookie = existingSid ? null : buildSessionCookie(sessionId);

  // 2. Parse JSON body. Bad JSON → still 204, just no upstream call.
  let body: unknown = null;
  try {
    const contentType = req.headers.get("content-type") ?? "";
    // sendBeacon may post application/octet-stream when given a Blob with
    // a JSON type — handle both shapes.
    const text = await req.text();
    if (text && (contentType.includes("json") || text.startsWith("{"))) {
      body = JSON.parse(text);
    }
  } catch {
    body = null;
  }

  const capture = captureFromRequest(req);
  const event = buildEvent({ body, sessionId, capture });
  if (!event) {
    // Missing/invalid event_type — drop silently, still seed the cookie.
    return noContent(setCookie);
  }

  // 3. Fire-and-forget the upstream forward. We deliberately await with a
  //    1s ceiling so logs reflect upstream health, but failures never
  //    surface to the user.
  await forwardEvent(event);

  return noContent(setCookie);
}

export async function GET(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: { allow: "POST", "cache-control": "no-store" },
  });
}

export async function PUT(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: { allow: "POST", "cache-control": "no-store" },
  });
}

export async function PATCH(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: { allow: "POST", "cache-control": "no-store" },
  });
}

export async function DELETE(): Promise<Response> {
  return new Response(null, {
    status: 405,
    headers: { allow: "POST", "cache-control": "no-store" },
  });
}
