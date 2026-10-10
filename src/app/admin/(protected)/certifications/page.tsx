import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CertificationsList } from "@/components/admin/certification-list";

export default async function AdminCertificationsPage() {
  const certifications = await db.certification.findMany({
    orderBy: [{ displayOrder: "asc" }, { issueDate: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Certifications</h2>
          <p className="mt-1 text-sm text-slate-500">
            Professional certifications, licenses, and credentials.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/certifications/new">+ Add Certification</Link>
        </Button>
      </div>
      <CertificationsList certifications={certifications} />
    </div>
  );
}