import { ArticleEditorForm } from "@/components/admin/article-editor-form";
import { db } from "@/lib/db";

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">New Article</h2>
      <ArticleEditorForm categories={categories} tags={tags} />
    </div>
  );
}