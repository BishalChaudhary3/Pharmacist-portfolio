import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/public/article-card";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Articles",
  description: "Evidence-based perspectives on medicines, pharmacy, and healthcare.",
};

interface PageProps {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { category, tag, q } = await searchParams;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
    ];
  }

  const [articles, categories] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        coverImage: true,
        category: true,
        author: true,
      },
    }),
    db.category.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return (
    <div className="container-content section-padding">
      <div className="max-w-2xl">
        <p className="eyebrow">Articles</p>
        <h1 className="mt-4 text-display-sm font-serif text-balance">
          Writing on medicines, pharmacy, and healthcare.
        </h1>
      </div>

      {/* Category filter */}
      <div className="mt-12 flex flex-wrap gap-2 border-b border-border pb-6">
        <Link
          href="/articles"
          className={`rounded-full border px-4 py-1.5 text-sm ${
            !category
              ? "border-primary bg-primary text-white"
              : "border-border text-text-muted hover:border-primary hover:text-primary"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/articles?category=${cat.slug}`}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              category === cat.slug
                ? "border-primary bg-primary text-white"
                : "border-border text-text-muted hover:border-primary hover:text-primary"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="mt-16 text-text-muted">
          {q ? `No articles found for "${q}".` : "No articles published yet."}
        </p>
      ) : (
        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}