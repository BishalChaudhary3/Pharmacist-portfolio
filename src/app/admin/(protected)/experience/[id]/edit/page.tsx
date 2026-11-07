import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExperienceForm } from "@/components/admin/experience-form";

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experience = await db.experience.findUnique({ where: { id } });
  if (!experience) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Edit Experience</h2>
      <ExperienceForm experience={experience} />
    </div>
  );
}