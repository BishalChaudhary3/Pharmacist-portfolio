import Link from "next/link";
import { formatDateShort } from "@/lib/utils";

interface Experience {
  id: string;
  title: string;
  organization: string;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
}

interface ExperiencePreviewProps {
  experiences: Experience[];
  content: Record<string, unknown>;
}

export function ExperiencePreview({ experiences, content }: ExperiencePreviewProps) {
  if (experiences.length === 0) return null;

  const heading = (content.heading as string) || "Professional Experience";

  return (
    <section className="section-padding">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Experience</p>
            <h2 className="mt-4 text-display-sm font-serif">{heading}</h2>
          </div>
          <Link href="/experience" className="text-sm font-medium text-primary link-underline">
            View full experience →
          </Link>
        </div>

        <ol className="mt-12 space-y-8">
          {experiences.map((exp) => (
            <li key={exp.id} className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="text-sm text-text-muted">
                {formatDateShort(exp.startDate)} —{" "}
                {exp.isCurrent ? "Present" : exp.endDate ? formatDateShort(exp.endDate) : ""}
              </div>
              <div className="border-l border-border pl-6">
                <h3 className="text-heading-3 font-serif">{exp.title}</h3>
                <p className="mt-1 text-sm text-primary">
                  {exp.organization}
                  {exp.location && <span className="text-text-muted"> · {exp.location}</span>}
                </p>
                {exp.description && (
                  <p className="mt-3 text-sm text-text-muted text-pretty">{exp.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}