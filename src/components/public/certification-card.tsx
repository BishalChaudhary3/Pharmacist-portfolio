import { Award, ExternalLink, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId: string | null;
  credentialUrl: string | null;
  certificateMediaUrl?: string | null;
  description: string | null;
}

export function CertificationCard({ certification }: { certification: Certification }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary/40">
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Award className="h-5 w-5" />
      </div>

      <h3 className="mt-5 font-serif text-heading-3 leading-snug text-balance">
        {certification.name}
      </h3>

      <p className="mt-2 text-sm text-primary">
        {certification.issuingOrganization}
      </p>

      <p className="mt-1 text-xs text-text-muted">
        Issued {formatDate(certification.issueDate)}
        {certification.expiryDate &&
          ` · Expires ${formatDate(certification.expiryDate)}`}
      </p>

      {certification.description && (
        <p className="mt-4 line-clamp-3 text-sm text-text-muted">
          {certification.description}
        </p>
      )}

      {certification.credentialId && (
        <p className="mt-4 text-xs text-text-muted">
          <span className="font-medium text-text-primary">Credential ID:</span>{" "}
          <span className="break-all">{certification.credentialId}</span>
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-4 pt-5">
        {certification.credentialUrl && (
          <a
            href={certification.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary link-underline"
          >
            Verify credential <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {certification.certificateMediaUrl && (
          <a
            href={certification.certificateMediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary link-underline"
          >
            View certificate <FileText className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}