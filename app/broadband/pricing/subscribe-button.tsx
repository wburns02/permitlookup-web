"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * Client button that hits /api/checkout/create-session and redirects to
 * the Stripe Checkout URL. If Stripe is not configured server-side, the
 * route handler returns 503 with a helpful message — we surface that
 * verbatim so the user knows what env var is missing.
 */
export function SubscribeButton({
  label,
  featured,
  priceTier = "pro",
}: {
  label: string;
  featured?: boolean;
  priceTier?: "pro" | "enterprise";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tier: priceTier }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body?.message ?? `Request failed (${res.status})`);
        return;
      }
      if (body?.url) {
        window.location.href = body.url as string;
        return;
      }
      setError("No checkout URL returned.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={
          "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 " +
          (featured
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50")
        }
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Redirecting&hellip;
          </>
        ) : (
          <>
            {label} <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {error}
        </p>
      )}
    </div>
  );
}
