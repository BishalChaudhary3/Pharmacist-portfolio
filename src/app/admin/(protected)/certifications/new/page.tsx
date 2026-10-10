import { CertificationForm } from "@/components/admin/certification-form";

export default function NewCertificationPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Add Certification</h2>
      <CertificationForm />
    </div>
  );
}