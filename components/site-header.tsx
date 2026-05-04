"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export type SiteHeaderVariant = "default" | "dumpster";

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
  const navLinks = isDumpster ? DUMPSTER_NAV_LINKS : DEFAULT_NAV_LINKS;
  const logoHref = isDumpster ? "/dumpster-leads" : "/";
  const ctaHref = isDumpster ? "/dumpster-leads" : "/hail-leads";

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
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
          >
            See Demo
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
              className="mt-2 rounded-md bg-indigo-600 px-3 py-3 text-center text-base font-medium text-white hover:bg-indigo-500"
            >
              See Demo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
