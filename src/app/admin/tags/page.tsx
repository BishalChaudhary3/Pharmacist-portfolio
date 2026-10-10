import { db } from "@/lib/db";
import { TagsManager } from "@/components/admin/tags-manager";

export default async function TagsPage() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Tags</h2>
        <p className="mt-1 text-sm text-slate-500">
          Specific topics used to categorize articles.
        </p>
      </div>
      <TagsManager tags={tags} />
    </div>
  );
}