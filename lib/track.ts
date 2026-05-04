/**
 * Client-side tracking lib for the dumpster-leads dashboard.
 *
 * All events are fire-and-forget. Errors are swallowed — never throws back to
 * the caller, never blocks the UI. Events only fire on dumpster pages.
 */

const STORAGE_KEY = "dumpster_vid";
const HEARTBEAT_INTERVAL_MS = 30_000;
const TRACK_PATH_PREFIXES = ["/dumpster-leads", "/admin/dumpster-analytics"];

let sessionStarted = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;

// ---------------------------------------------------------------------------
// visitor_id
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function uuidv4(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  // RFC4122 v4 fallback for crusty environments.
  const buf = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < 16; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const hex = Array.from(buf, (b) => b.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
}

/**
 * Returns the persistent visitor_id from localStorage. Generates one if
 * missing. Returns an empty string in non-browser contexts.
 */
export function getVisitorId(): string {
  if (!isBrowser()) return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length > 0) return existing;
    const next = uuidv4();
    window.localStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    // localStorage unavailable (Safari private mode, etc.) — return an
    // ephemeral id so we don't crash callers.
    return uuidv4();
  }
}

// ---------------------------------------------------------------------------
// Path gate
// ---------------------------------------------------------------------------

function shouldTrack(): boolean {
  if (!isBrowser()) return false;
  try {
    const path = window.location.pathname || "";
    return TRACK_PATH_PREFIXES.some((p) => path.startsWith(p));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// trackEvent
// ---------------------------------------------------------------------------

/**
 * Fire-and-forget event tracker. Uses navigator.sendBeacon when available,
 * falls back to fetch with keepalive. Never throws to the caller.
 */
export function trackEvent(
  event_type: string,
  payload?: Record<string, unknown>,
): void {
  try {
    if (!isBrowser()) return;
    if (!shouldTrack()) return;

    const body = JSON.stringify({
      event_type,
      payload: payload ?? null,
      path: window.location.pathname,
      visitor_id: getVisitorId(),
      viewport_width: window.innerWidth,
      referrer: document.referrer || null,
    });

    let sent = false;
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function"
      ) {
        const blob = new Blob([body], { type: "application/json" });
        sent = navigator.sendBeacon("/api/events", blob);
      }
    } catch {
      sent = false;
    }

    if (!sent) {
      try {
        void fetch("/api/events", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* swallow */
      }
    }
  } catch {
    /* swallow — never throw */
  }
}

// ---------------------------------------------------------------------------
// startSessionTracking
// ---------------------------------------------------------------------------

/**
 * Wires up automatic page_view firing on mount and a heartbeat every 30s.
 * Call once from a top-level dumpster client component. Safe to call more
 * than once (idempotent).
 */
export function startSessionTracking(): void {
  try {
    if (!isBrowser()) return;
    if (sessionStarted) return;
    sessionStarted = true;

    // Fire page_view immediately.
    trackEvent("page_view");

    // Heartbeat every 30s while tab is visible.
    heartbeatTimer = setInterval(() => {
      try {
        if (document.visibilityState === "visible") {
          trackEvent("heartbeat");
        }
      } catch {
        /* swallow */
      }
    }, HEARTBEAT_INTERVAL_MS);

    // visibilitychange — nice-to-have observability into tab focus.
    visibilityHandler = () => {
      try {
        if (document.visibilityState === "visible") {
          trackEvent("tab_visible");
        } else {
          trackEvent("tab_hidden");
        }
      } catch {
        /* swallow */
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  } catch {
    /* swallow */
  }
}
