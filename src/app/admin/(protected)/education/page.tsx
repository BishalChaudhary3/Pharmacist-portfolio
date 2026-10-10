import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { EducationList } from "@/components/admin/education-list";

export default async function AdminEducationPage() {
  const education = await db.education.findMany({
    orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Education</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add, reorder, or hide your academic background.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/education/new">+ Add Education</Link>
        </Button>
      </div>
      <EducationList education={education} />
    </div>
  );
}