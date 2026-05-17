"use client";

import { use, useEffect, useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
};

type Usage = {
  plan: string;
  period_start: string;
  period_end: string;
  used: number;
  cap: number;
};

type PortalData = {
  email: string;
  keys: ApiKey[];
  usage: Usage;
};

/**
 * Portal data is fetched from /api/portal/me. That endpoint is intentionally
 * not implemented yet — until it exists, we render a "not configured" notice
 * with the next step (wire Stripe + auth). This keeps /broadband/portal
 * routable and shaped for the eventual real data.
 */
export function PortalClient({
  searchParamsPromise,
}: {
  searchParamsPromise?: Promise<{ session_id?: string }>;
}) {
  const sp = searchParamsPromise ? use(searchParamsPromise) : undefined;
  const justCheckedOut = Boolean(sp?.session_id);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PortalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPending, setSigninPending] = useState(false);
  const [signinMsg, setSigninMsg] = useState<string | null>(null);
  const [revealKeyId, setRevealKeyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portal/me", { cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) setData(null);
          return;
        }
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (!cancelled)
            setError(body?.message ?? `Request failed (${res.status})`);
          return;
        }
        if (!cancelled) setData(body as PortalData);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSigninMsg(null);
    setSigninPending(true);
    try {
      const res = await fetch("/api/portal/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: signinEmail }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSigninMsg(body?.message ?? `Request failed (${res.status})`);
        return;
      }
      setSigninMsg(
        body?.message ??
          "Check your inbox — we sent you a sign-in link (valid 15 minutes).",
      );
    } catch (err) {
      setSigninMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSigninPending(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-emerald-600" />
        Loading portal&hellip;
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        <div className="font-semibold">Couldn&apos;t load portal data</div>
        <div className="mt-1 text-amber-800">{error}</div>
        <div className="mt-3 text-xs text-amber-700">
          The portal API is scaffolded but not yet wired to the upstream
          permit-api. See STRIPE_SETUP_TODO.md.
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-600">
            Use the email on your Stripe receipt. We&apos;ll email you a
            magic-link that expires in 15 minutes.
          </p>
          <form onSubmit={sendMagicLink} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              placeholder="you@company.com"
              value={signinEmail}
              onChange={(e) => setSigninEmail(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="submit"
              disabled={signinPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {signinPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Sending&hellip;
                </>
              ) : (
                "Email me a sign-in link"
              )}
            </button>
          </form>
          {signinMsg && (
            <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {signinMsg}
            </p>
          )}
          {justCheckedOut && (
            <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Payment received — your API key is on its way by email. Sign in
              above with the same address to manage your keys.
            </div>
          )}
        </div>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-600">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            What you&apos;ll see after sign-in
          </h3>
          <ul className="mt-4 space-y-3">
            <li className="flex gap-2">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Your active API keys with prefix + last-used time.</span>
            </li>
            <li className="flex gap-2">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>Generate a new key or revoke an old one with one click.</span>
            </li>
            <li className="flex gap-2">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>This month&apos;s usage vs your plan&apos;s monthly cap.</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Signed-in view.
  const pct =
    data.usage.cap > 0
      ? Math.min(100, Math.round((data.usage.used / data.usage.cap) * 100))
      : 0;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Usage this period</h2>
            <p className="mt-1 text-sm text-slate-500">
              {data.email} &middot; plan: {data.usage.plan}
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {new Date(data.usage.period_start).toLocaleDateString()} →{" "}
            {new Date(data.usage.period_end).toLocaleDateString()}
          </div>
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-sm text-slate-600">
            <span>
              <span className="text-xl font-semibold text-slate-900">
                {data.usage.used.toLocaleString()}
              </span>{" "}
              / {data.usage.cap.toLocaleString()} lookups
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className={
                "h-2 rounded-full " +
                (pct < 75
                  ? "bg-emerald-500"
                  : pct < 95
                    ? "bg-amber-500"
                    : "bg-red-500")
              }
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 md:px-8">
          <h2 className="text-lg font-semibold text-slate-900">API keys</h2>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500"
          >
            <RefreshCw className="h-4 w-4" /> New key
          </button>
        </div>
        <ul className="divide-y divide-slate-200">
          {data.keys.length === 0 && (
            <li className="px-6 py-6 text-sm text-slate-500 md:px-8">
              No keys yet. Click &ldquo;New key&rdquo; to generate one.
            </li>
          )}
          {data.keys.map((k) => {
            const revealed = revealKeyId === k.id;
            return (
              <li
                key={k.id}
                className="flex flex-wrap items-center gap-4 px-6 py-4 md:px-8"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 font-mono text-sm text-slate-900">
                    {revealed ? `${k.key_prefix}••••••••••••••••••••••••` : `${k.key_prefix}••••`}
                    <button
                      type="button"
                      onClick={() => setRevealKeyId(revealed ? null : k.id)}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label={revealed ? "Hide" : "Reveal prefix"}
                    >
                      {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void navigator.clipboard.writeText(k.key_prefix)}
                      className="text-slate-400 hover:text-slate-700"
                      aria-label="Copy prefix"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {k.name || "default"} &middot; created{" "}
                    {new Date(k.created_at).toLocaleDateString()}
                    {k.last_used_at &&
                      ` · last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (k.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600")
                  }
                >
                  {k.is_active ? "Active" : "Revoked"}
                </span>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                >
                  Revoke
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
