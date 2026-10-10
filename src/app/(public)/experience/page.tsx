import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ExperienceTimeline } from "@/components/public/experience-timeline";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience in pharmacy and healthcare.",
};

export default async function ExperiencePage() {
  const experiences = await db.experience.findMany({
    where: { enabled: true },
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="container-prose section-padding">
      <p className="eyebrow">Experience</p>
      <h1 className="mt-4 text-display-sm font-serif text-balance">
        Professional Experience
      </h1>
      <p className="mt-6 text-body-lg text-text-muted">
        A career dedicated to pharmaceutical care and healthcare communication.
      </p>

      <div className="mt-16">
        <ExperienceTimeline experiences={experiences} />
      </div>
    </div>
  );
}