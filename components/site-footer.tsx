import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SiteHeaderVariant } from "@/components/site-header";

type FooterTokens = {
  shell: string;
  brand: string;
  divider: string;
  link: string;
  linkHover: string;
};

const TOKENS: Record<SiteHeaderVariant, FooterTokens> = {
  default: {
    shell: "border-t border-slate-200 bg-white text-slate-500",
    brand: "text-indigo-600",
    divider: "text-slate-300",
    link: "text-slate-600",
    linkHover: "hover:text-indigo-600",
  },
  broadband: {
    shell: "border-t border-sky-500/15 bg-[#050816] text-slate-400",
    brand: "text-sky-400 font-mono",
    divider: "text-slate-700",
    link: "text-slate-300",
    linkHover: "hover:text-sky-300",
  },
  roofers: {
    shell: "border-t border-orange-500/20 bg-[#0b0a0a] text-stone-400",
    brand: "text-orange-400",
    divider: "text-stone-700",
    link: "text-stone-300",
    linkHover: "hover:text-orange-300",
  },
  dumpster: {
    shell: "border-t-2 border-yellow-400/40 bg-black text-stone-400",
    brand: "text-yellow-400 font-display-stencil",
    divider: "text-stone-700",
    link: "text-stone-300 uppercase tracking-wider text-xs",
    linkHover: "hover:text-yellow-300",
  },
};

export function SiteFooter({
  variant = "default",
}: {
  variant?: SiteHeaderVariant;
}) {
  const t = TOKENS[variant];
  const brandLabel =
    variant === "broadband" ? (
      <>
        <span className={t.brand}>{"//"}</span>broadband
      </>
    ) : variant === "roofers" ? (
      <>
        <span className={t.brand}>Storm</span>Strike
      </>
    ) : variant === "dumpster" ? (
      <span className={t.brand}>DUMPSTER LEADS</span>
    ) : (
      <>
        <span className={t.brand}>Permit</span>Lookup
      </>
    );

  return (
    <footer className={cn(t.shell)} id="contact">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold">
            {brandLabel}
          </Link>
          <span aria-hidden className={t.divider}>
            ·
          </span>
          <span>© 2026</span>
        </div>
        <a
          href="mailto:contact@permitlookup.com"
          className={cn("transition", t.link, t.linkHover)}
        >
          contact@permitlookup.com
        </a>
      </div>
    </footer>
  );
}
