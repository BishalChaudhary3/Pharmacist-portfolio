import { db } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Categories</h2>
        <p className="mt-1 text-sm text-slate-500">
          Organize your articles into broad topics.
        </p>
      </div>
      <CategoriesManager categories={categories} />
    </div>
  );
}