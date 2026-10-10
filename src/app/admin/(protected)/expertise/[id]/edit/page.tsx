import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ExpertiseForm } from "@/components/admin/expertise-form";

export default async function EditExpertisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expertise = await db.expertise.findUnique({ where: { id } });
  if (!expertise) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Edit Expertise</h2>
      <ExpertiseForm expertise={expertise} />
    </div>
  );
}