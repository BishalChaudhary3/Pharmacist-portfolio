import { EducationForm } from "@/components/admin/education-form";

export default function NewEducationPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Add Education</h2>
      <EducationForm />
    </div>
  );
}