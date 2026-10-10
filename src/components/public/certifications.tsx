"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Award } from "lucide-react";
import { CertificationCard } from "./certification-card";
import { cn } from "@/lib/utils";

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateMediaUrl: string | null;
  description: string | null;
}

interface CertificationsCarouselProps {
  certifications: Certification[];
}

export function CertificationsCarousel({ certifications }: CertificationsCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-cert-card]");
    const cardWidth = card?.offsetWidth ?? el.clientWidth / 3;
    const gap = 24;
    el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
  };

  if (certifications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-12 text-center">
        <Award className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm text-text-muted">
          Certifications will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {certifications.length > 1 && (
        <div className="pointer-events-none absolute -top-14 right-0 flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              scrollByCard(-1);
            }}
            disabled={!canScrollLeft}
            aria-label="Previous certifications"
            className={cn(
              "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              canScrollLeft
                ? "hover:border-primary hover:text-primary"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              scrollByCard(1);
            }}
            disabled={!canScrollRight}
            aria-label="Next certifications"
            className={cn(
              "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              canScrollRight
                ? "hover:border-primary hover:text-primary"
                : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {certifications.map((cert) => (
          <div
            key={cert.id}
            data-cert-card
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
          >
            <CertificationCard certification={cert} />
          </div>
        ))}
      </div>
    </div>
  );
}