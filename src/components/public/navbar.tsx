import Link from "next/link";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { MobileNav } from "./mobile-nav";

async function SiteName() {
  const settings = await db.siteSettings.findFirst();
  return (
    <Link href="/" className="font-serif text-xl text-primary">
      {settings?.siteName || "Pharmacist"}
    </Link>
  );
}

async function NavItems() {
  const navItems = await db.navigationItem.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
      {navItems.map((item) => (
        <Link
          key={item.id}
          href={item.url}
          className="text-sm font-medium text-text-muted transition-colors hover:text-primary"
          {...(item.isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

async function MobileNavItems() {
  const navItems = await db.navigationItem.findMany({
    where: { enabled: true },
    orderBy: { displayOrder: "asc" },
  });

  return <MobileNav items={navItems} />;
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-content flex h-16 items-center justify-between">
        <Suspense fallback={<div className="h-6 w-40 animate-pulse rounded bg-slate-200" />}>
          <SiteName />
        </Suspense>

        <Suspense fallback={<NavSkeleton />}>
          <NavItems />
        </Suspense>

        <Suspense fallback={<NavSkeleton />}>
          <MobileNavItems />
        </Suspense>
      </div>
    </header>
  );
}

function NavSkeleton() {
  return (
    <div className="hidden items-center gap-8 md:flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-4 w-16 animate-pulse rounded bg-slate-200" />
      ))}
    </div>
  );
}