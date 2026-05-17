"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export type SiteHeaderVariant = "default" | "dumpster" | "broadband";

const DEFAULT_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/hail-leads", label: "Hail Leads" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#contact", label: "Contact" },
];

const DUMPSTER_NAV_LINKS: NavLink[] = [
  { href: "/dumpster-leads", label: "Home" },
  {
    href: "mailto:contact@permitlookup.com?subject=Dumpster%20Leads%20pricing",
    label: "Pricing",
  },
  { href: "mailto:contact@permitlookup.com", label: "Contact" },
];

const BROADBAND_NAV_LINKS: NavLink[] = [
  { href: "/broadband", label: "Home" },
  { href: "/broadband#try-it", label: "Try it" },
  { href: "/broadband#docs", label: "Docs" },
  { href: "/broadband/pricing", label: "Pricing" },
  { href: "/broadband/portal", label: "Portal" },
];

export function SiteHeader({
  variant = "default",
}: {
  variant?: SiteHeaderVariant;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDumpster = variant === "dumpster";
  const isBroadband = variant === "broadband";
  const navLinks = isBroadband
    ? BROADBAND_NAV_LINKS
    : isDumpster
      ? DUMPSTER_NAV_LINKS
      : DEFAULT_NAV_LINKS;
  const logoHref = isBroadband
    ? "/broadband"
    : isDumpster
      ? "/dumpster-leads"
      : "/";
  const ctaHref = isBroadband
    ? "/broadband#try-it"
    : isDumpster
      ? "/dumpster-leads"
      : "/hail-leads";
  const ctaLabel = isBroadband ? "Try the API" : "See Demo";
  const ctaClass = isBroadband
    ? "bg-emerald-600 hover:bg-emerald-500"
    : "bg-indigo-600 hover:bg-indigo-500";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-slate-200 bg-white/90 backdrop-blur"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href={logoHref}
          className="flex items-baseline gap-1 text-lg font-semibold tracking-tight text-slate-900"
        >
          <span className="text-indigo-600">Permit</span>
          <span>Lookup</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition",
              ctaClass,
            )}
          >
            {ctaLabel}
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className={cn(
                "mt-2 rounded-md px-3 py-3 text-center text-base font-medium text-white",
                ctaClass,
              )}
            >
              {ctaLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
