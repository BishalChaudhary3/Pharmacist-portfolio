import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ExpertiseList } from "@/components/admin/expertise-list";

export default async function AdminExpertisePage() {
  const expertise = await db.expertise.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Expertise</h2>
          <p className="mt-1 text-sm text-slate-500">
            Areas of professional expertise shown on the homepage.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/expertise/new">+ Add Expertise</Link>
        </Button>
      </div>
      <ExpertiseList expertise={expertise} />
    </div>
  );
}