"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  label: string;
  url: string;
  isExternal: boolean;
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-16 border-b border-border bg-background">
          <nav className="container-content flex flex-col py-4" aria-label="Mobile navigation">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-text-primary hover:text-primary"
                {...(item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}