import { formatDateShort } from "@/lib/utils";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

export function EducationTimeline({ education }: { education: Education[] }) {
  if (education.length === 0) {
    return <p className="text-sm text-text-muted">No education entries yet.</p>;
  }

  return (
    <ol className="space-y-10">
      {education.map((edu) => (
        <li key={edu.id} className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="text-sm font-medium text-text-muted">
            {formatDateShort(edu.startDate)} —{" "}
            {edu.endDate ? formatDateShort(edu.endDate) : "Present"}
          </div>
          <div className="border-l-2 border-border pl-6">
            <h3 className="text-heading-3 font-serif">{edu.degree}</h3>
            <p className="mt-1 text-sm text-primary">
              {edu.institution}
              {edu.field && <span className="text-text-muted"> · {edu.field}</span>}
              {edu.location && <span className="text-text-muted"> · {edu.location}</span>}
            </p>
            {edu.description && (
              <p className="mt-3 text-sm text-text-muted text-pretty">{edu.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}