"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string };

export type SiteHeaderVariant =
  | "default"
  | "dumpster"
  | "broadband"
  | "roofers";

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

const ROOFERS_NAV_LINKS: NavLink[] = [
  { href: "/roofers", label: "Home" },
  { href: "/roofers#try-it", label: "Try it" },
  { href: "/roofers#docs", label: "Docs" },
  { href: "/roofers#pricing", label: "Pricing" },
];

// Per-variant visual tokens — keeps the header coherent with each product's
// hero motif so visitors never feel like they crossed into a different site.
type Tokens = {
  shell: string;
  shellScrolled: string;
  navLink: string;
  navLinkHover: string;
  ctaBg: string;
  brandLeft: string;
  brandRight: string;
  mobileSheet: string;
  mobileLink: string;
};
const TOKENS: Record<SiteHeaderVariant, Tokens> = {
  default: {
    shell: "border-b border-transparent bg-transparent",
    shellScrolled: "border-b border-slate-200 bg-white/90 backdrop-blur",
    navLink: "text-slate-600",
    navLinkHover: "hover:text-slate-900",
    ctaBg: "bg-indigo-600 hover:bg-indigo-500 text-white",
    brandLeft: "text-indigo-600",
    brandRight: "text-slate-900",
    mobileSheet: "border-t border-slate-200 bg-white",
    mobileLink: "text-slate-700 hover:bg-slate-100",
  },
  broadband: {
    shell: "border-b border-transparent bg-transparent",
    shellScrolled:
      "border-b border-sky-500/15 bg-[#050816]/85 backdrop-blur supports-[backdrop-filter]:bg-[#050816]/70",
    navLink: "text-slate-300",
    navLinkHover: "hover:text-sky-300",
    ctaBg:
      "bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_24px_-8px_rgba(56,189,248,0.6)]",
    brandLeft: "text-sky-400",
    brandRight: "text-slate-100",
    mobileSheet: "border-t border-sky-500/15 bg-[#050816]",
    mobileLink: "text-slate-200 hover:bg-sky-500/10",
  },
  roofers: {
    shell: "border-b border-transparent bg-transparent",
    shellScrolled:
      "border-b border-orange-500/20 bg-[#0b0a0a]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0b0a0a]/70",
    navLink: "text-stone-300",
    navLinkHover: "hover:text-orange-300",
    ctaBg:
      "bg-orange-500 hover:bg-orange-400 text-stone-950 shadow-[0_0_28px_-8px_rgba(249,115,22,0.7)]",
    brandLeft: "text-orange-400",
    brandRight: "text-stone-100",
    mobileSheet: "border-t border-orange-500/20 bg-[#0b0a0a]",
    mobileLink: "text-stone-200 hover:bg-orange-500/10",
  },
  dumpster: {
    shell: "border-b border-transparent bg-transparent",
    shellScrolled:
      "border-b-2 border-yellow-400/40 bg-black/90 backdrop-blur",
    navLink: "text-stone-300 uppercase tracking-wider text-xs font-semibold",
    navLinkHover: "hover:text-yellow-300",
    ctaBg:
      "bg-yellow-400 hover:bg-yellow-300 text-black uppercase tracking-wider font-bold",
    brandLeft: "text-yellow-400",
    brandRight: "text-stone-100",
    mobileSheet: "border-t-2 border-yellow-400/40 bg-black",
    mobileLink:
      "text-stone-200 uppercase tracking-wider text-sm hover:bg-yellow-400/10",
  },
};

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
  const isRoofers = variant === "roofers";
  const navLinks = isRoofers
    ? ROOFERS_NAV_LINKS
    : isBroadband
      ? BROADBAND_NAV_LINKS
      : isDumpster
        ? DUMPSTER_NAV_LINKS
        : DEFAULT_NAV_LINKS;
  const logoHref = isRoofers
    ? "/roofers"
    : isBroadband
      ? "/broadband"
      : isDumpster
        ? "/dumpster-leads"
        : "/";
  const ctaHref = isRoofers
    ? "/roofers#try-it"
    : isBroadband
      ? "/broadband#try-it"
      : isDumpster
        ? "mailto:contact@permitlookup.com?subject=Dumpster%20Leads"
        : "/hail-leads";
  const ctaLabel = isDumpster
    ? "Get Leads"
    : isRoofers
      ? "Try Dispatch"
      : isBroadband
        ? "Try the API"
        : "See Demo";

  const t = TOKENS[variant];
  const brandWordmark = isDumpster ? (
    <Link
      href={logoHref}
      className="font-display-stencil flex items-baseline gap-1 text-xl"
    >
      <span className={t.brandLeft}>DUMPSTER</span>
      <span className={t.brandRight}>LEADS</span>
    </Link>
  ) : isRoofers ? (
    <Link
      href={logoHref}
      className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight"
    >
      <span className={t.brandLeft}>Storm</span>
      <span className={t.brandRight}>Strike</span>
    </Link>
  ) : isBroadband ? (
    <Link
      href={logoHref}
      className="flex items-baseline gap-1 text-lg font-semibold tracking-tight"
    >
      <span className={`font-mono ${t.brandLeft}`}>{"//"}</span>
      <span className={t.brandRight}>broadband</span>
    </Link>
  ) : (
    <Link
      href={logoHref}
      className="flex items-baseline gap-1 text-lg font-semibold tracking-tight text-slate-900"
    >
      <span className={t.brandLeft}>Permit</span>
      <span className={t.brandRight}>Lookup</span>
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled ? t.shellScrolled : t.shell,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {brandWordmark}

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                t.navLink,
                t.navLinkHover,
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            className={cn(
              "rounded-lg px-4 py-2 text-sm shadow-sm transition",
              t.ctaBg,
            )}
          >
            {ctaLabel}
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden",
            variant === "default"
              ? "text-slate-700 hover:bg-slate-100"
              : "text-stone-200 hover:bg-white/10",
          )}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className={cn("md:hidden", t.mobileSheet)}>
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-3 text-base font-medium",
                  t.mobileLink,
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className={cn(
                "mt-2 rounded-md px-3 py-3 text-center text-base shadow-sm",
                t.ctaBg,
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
