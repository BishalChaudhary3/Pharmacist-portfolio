import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CertificationForm } from "@/components/admin/certification-form";

export default async function EditCertificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certification = await db.certification.findUnique({
    where: { id },
    include: { certificateMedia: true },
  });
  if (!certification) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Edit Certification</h2>
      <CertificationForm certification={certification} />
    </div>
  );
}