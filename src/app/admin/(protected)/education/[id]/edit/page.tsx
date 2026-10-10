import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EducationForm } from "@/components/admin/education-form";

export default async function EditEducationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const education = await db.education.findUnique({ where: { id } });
  if (!education) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Edit Education</h2>
      <EducationForm education={education} />
    </div>
  );
}