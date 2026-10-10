import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { db } from "@/lib/db";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.siteSettings.findFirst();

  const siteName = settings?.siteName || "Pharmacist";

  return {
    title: {
      default: `${siteName} — Pharmacist & Healthcare Writer`,
      template: `%s | ${siteName}`,
    },
    description:
      settings?.siteDescription ||
      "Evidence-based perspectives on medicines, pharmacy, and healthcare.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}