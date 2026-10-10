import { ExpertiseForm } from "@/components/admin/expertise-form";

export default function NewExpertisePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Add Expertise</h2>
      <ExpertiseForm />
    </div>
  );
}