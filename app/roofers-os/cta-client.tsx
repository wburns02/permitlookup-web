"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

// Lightweight client-side interest form. Mailto fallback if the user prefers
// — but the form gives us a faster signal-capture surface.
export function RoofCrmInterestForm() {
  const [email, setEmail] = useState("");
  const [crews, setCrews] = useState("1-3");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("RoofCRM demo request");
    const body = encodeURIComponent(
      `Email: ${email}\nFleet size: ${crews} trucks\n\nInterested in a RoofCRM pilot.`,
    );
    window.location.href = `mailto:will@ecbtx.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-[#c87b3e]/40 bg-[#c87b3e]/10 p-6 text-center">
        <Check className="mx-auto h-6 w-6 text-[#e0975a]" />
        <p className="mt-3 text-sm font-semibold text-slate-100">
          Mail client opened. If nothing happened, email{" "}
          <a
            href="mailto:will@ecbtx.com"
            className="underline decoration-[#e0975a]"
          >
            will@ecbtx.com
          </a>{" "}
          directly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-3 rounded-xl border border-[#c87b3e]/25 bg-[#141a23]/80 p-5 sm:grid-cols-[1fr_140px_auto]"
    >
      <input
        type="email"
        required
        placeholder="you@your-roofing-co.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-[#1c232e] bg-[#0d1117] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#c87b3e] focus:outline-none focus:ring-1 focus:ring-[#c87b3e]"
      />
      <select
        value={crews}
        onChange={(e) => setCrews(e.target.value)}
        className="rounded-md border border-[#1c232e] bg-[#0d1117] px-3 py-2.5 text-sm text-slate-100 focus:border-[#c87b3e] focus:outline-none focus:ring-1 focus:ring-[#c87b3e]"
      >
        <option value="1-3">1-3 trucks</option>
        <option value="4-10">4-10 trucks</option>
        <option value="10+">10+ trucks</option>
      </select>
      <button
        type="submit"
        className="copper-cta inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm uppercase tracking-wide"
      >
        Book demo <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
