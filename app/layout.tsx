import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
  if (host.startsWith("storms.") || host.startsWith("roofers."))
    return "roofers";
  return "default";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const variant = await resolveHeaderVariant();
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SiteHeader variant={variant} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
