import { ExperienceForm } from "@/components/admin/experience-form";

export default function NewExperiencePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Add Experience</h2>
      <ExperienceForm />
    </div>
  );
}