import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Oswald } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SiteHeader, type SiteHeaderVariant } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

// Geometric mono for broadband stats / endpoint paths
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Heavy display for dumpster-leads ("HEAVY HAUL" / "CONSTRUCTION ZONE" feel)
const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PermitLookup · Hail Leads for Texas Roofers",
  description:
    "PermitLookup joins NOAA storm data with every Texas roof permit pulled. See the addresses hit by hail AND already in a claim cycle.",
};

async function resolveHeaderVariant(): Promise<SiteHeaderVariant> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase();
  if (host.startsWith("dumpster.")) return "dumpster";
  if (host.startsWith("broadband.")) return "broadband";
  if (host.startsWith("hail.")) return "hail";
  if (host.startsWith("roofers.")) return "roofers-os";
  if (host.startsWith("storms.")) return "roofers";
  return "default";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const variant = await resolveHeaderVariant();
  // Hostname → top-level theme. The page itself can override by setting its own
  // data-theme on a wrapper. We seed it on <body> so default routes inherit
  // sensible tokens too.
  const theme: string | undefined =
    variant === "broadband" ? "broadband"
    : variant === "roofers" ? "roofers"
    : variant === "roofers-os" ? "roofers-os"
    : variant === "hail" ? "hail"
    : variant === "dumpster" ? "dumpster"
    : undefined;
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body
        data-theme={theme}
        className={
          theme
            ? "theme-shell min-h-full flex flex-col"
            : "min-h-full flex flex-col bg-slate-50 text-slate-900"
        }
      >
        <SiteHeader variant={variant} />
        <main className="flex-1">{children}</main>
        <SiteFooter variant={variant} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
