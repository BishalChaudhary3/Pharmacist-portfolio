import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";

async function FooterContent() {
  const settings = await db.siteSettings.findFirst();
  const navItems = await db.navigationItem.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="container-content py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-serif text-xl text-primary">
            {settings?.siteName || "[PHARMACIST_NAME]"}
          </h3>
          <p className="mt-2 text-sm text-text-muted">
            {settings?.siteDescription || "Pharmacist & Healthcare Writer"}
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Navigation</h4>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.url}
                  className="text-sm text-text-muted hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            {settings?.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-primary"
                >
                  {settings.email}
                </a>
              </li>
            )}
            {settings?.location && <li>{settings.location}</li>}
          </ul>
        </div>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <p className="text-xs text-text-muted">
          {settings?.medicalDisclaimer ||
            "The information on this website is for general educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment."}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            {settings?.copyright ||
              `© ${new Date().getFullYear()} [PHARMACIST_NAME]. All rights reserved.`}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <Link href="/disclaimer" className="hover:text-primary">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Suspense fallback={<FooterSkeleton />}>
        <FooterContent />
      </Suspense>
    </footer>
  );
}

function FooterSkeleton() {
  return (
    <div className="container-content py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2 space-y-3">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}