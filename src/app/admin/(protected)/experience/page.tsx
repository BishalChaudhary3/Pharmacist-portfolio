import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ExperienceList } from "@/components/admin/experience-list";

export default async function AdminExperiencePage() {
  const experiences = await db.experience.findMany({
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Experience</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add, reorder, or hide professional experience entries.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/experience/new">+ Add Experience</Link>
        </Button>
      </div>
      <ExperienceList experiences={experiences} />
    </div>
  );
}