import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white" id="contact">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-slate-900">
            <span className="text-indigo-600">Permit</span>Lookup
          </Link>
          <span aria-hidden className="text-slate-300">
            ·
          </span>
          <span>© 2026</span>
        </div>
        <a
          href="mailto:contact@permitlookup.com"
          className="text-slate-600 hover:text-indigo-600"
        >
          contact@permitlookup.com
        </a>
      </div>
    </footer>
  );
}
