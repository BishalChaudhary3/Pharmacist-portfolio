import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleEditorForm } from "@/components/admin/article-editor-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories, tags] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: {
        tags: { select: { tagId: true } },
        coverImage: true,
        ogImage: true,
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Edit Article</h2>
      <ArticleEditorForm
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          categoryId: article.categoryId,
          status: article.status,
          isFeatured: article.isFeatured,
          featuredOrder: article.featuredOrder,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          canonicalUrl: article.canonicalUrl,
          coverImageId: article.coverImageId,
          coverImage: article.coverImage,
          ogImageId: article.ogImageId,
          ogImage: article.ogImage,
          tags: article.tags,
        }}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}