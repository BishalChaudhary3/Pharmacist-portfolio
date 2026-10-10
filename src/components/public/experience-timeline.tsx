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

export function ExperienceTimeline({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) {
    return <p className="text-sm text-text-muted">No experience entries yet.</p>;
  }

  return (
    <ol className="space-y-12">
      {experiences.map((exp) => (
        <li key={exp.id} className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="text-sm font-medium text-text-muted">
            {formatDateShort(exp.startDate)} —{" "}
            {exp.isCurrent ? "Present" : exp.endDate ? formatDateShort(exp.endDate) : ""}
          </div>
          <div className="border-l-2 border-border pl-6">
            <h2 className="text-heading-2 font-serif">{exp.title}</h2>
            <p className="mt-1 text-sm text-primary">
              {exp.organization}
              {exp.location && <span className="text-text-muted"> · {exp.location}</span>}
            </p>
            {exp.description && (
              <p className="mt-4 text-body text-text-muted text-pretty whitespace-pre-line">
                {exp.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}