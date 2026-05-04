"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Lock, ArrowRight } from "lucide-react";

const STORAGE_KEY = "pl_demo_unlocked";

export function HailLeadsGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const expected = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";
    if (!expected) {
      setError("Demo password is not configured.");
      setSubmitting(false);
      return;
    }

    if (password === expected) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore storage failures */
      }
      setUnlocked(true);
    } else {
      setError("That password doesn't match. Try again.");
    }
    setSubmitting(false);
  }

  // Initial hydration flash — render nothing (tiny) until we know.
  if (unlocked === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Enter demo password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This preview is gated while we onboard partner roofers. Enter the
          password you were given to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="pl-demo-password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Demo password
            </label>
            <input
              id="pl-demo-password"
              type="password"
              autoComplete="off"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder={"#Espn2025"}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || password.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Unlock demo <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-500">
          Don&apos;t have a password?{" "}
          <a
            href="mailto:contact@permitlookup.com"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Request access
          </a>
          .
        </p>
      </div>
    </div>
  );
}
