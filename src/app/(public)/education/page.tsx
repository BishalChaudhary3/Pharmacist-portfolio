import type { Metadata } from "next";
import { db } from "@/lib/db";
import { EducationTimeline } from "@/components/public/education-timeline";

export const metadata: Metadata = {
  title: "Education",
  description: "Academic background and qualifications.",
};

export default async function EducationPage() {
  const education = await db.education.findMany({
    where: { enabled: true },
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="container-prose section-padding">
      <p className="eyebrow">Education</p>
      <h1 className="mt-4 text-display-sm font-serif text-balance">
        Education & Training
      </h1>
      <p className="mt-6 text-body-lg text-text-muted">
        The academic foundations behind my practice.
      </p>

      <div className="mt-16">
        <EducationTimeline education={education} />
      </div>
    </div>
  );
}