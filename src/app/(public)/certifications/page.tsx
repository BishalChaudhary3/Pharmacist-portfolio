import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CertificationsCarousel } from "@/components/public/certifications";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Professional certifications, licenses, and credentials in pharmacy and healthcare.",
};

export default async function CertificationsPage() {
  const certifications = await db.certification.findMany({
    where: { enabled: true },
    orderBy: [{ displayOrder: "asc" }, { issueDate: "desc" }],
    include: { certificateMedia: true },
  });

  // Flatten so the client component receives only what it needs
  const data = certifications.map((cert) => ({
    id: cert.id,
    name: cert.name,
    issuingOrganization: cert.issuingOrganization,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    credentialId: cert.credentialId,
    credentialUrl: cert.credentialUrl,
    certificateMediaUrl: cert.certificateMedia?.url ?? null,
    description: cert.description,
  }));

  return (
    <div className="container-content section-padding">
      <div className="max-w-2xl">
        <p className="eyebrow">Credentials</p>
        <h1 className="mt-4 text-display-sm font-serif text-balance">
          Professional Certifications
        </h1>
        <p className="mt-6 text-body-lg text-text-muted text-pretty">
          Licenses, credentials, and continuing education in pharmacy and
          healthcare.
        </p>
      </div>

      <div className="mt-16">
        <CertificationsCarousel certifications={data} />
      </div>

      {certifications.length > 0 && (
        <p className="mt-12 text-center text-sm text-text-muted">
          {certifications.length}{" "}
          {certifications.length === 1 ? "certification" : "certifications"} on record
        </p>
      )}
    </div>
  );
}