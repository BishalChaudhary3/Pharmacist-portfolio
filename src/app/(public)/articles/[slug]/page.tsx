import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { AuthorCard } from "@/components/public/author-card";
import { ArticleCard } from "@/components/public/article-card";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}


async function getArticle(slug: string) {
  return db.article.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      coverImage: true,
      category: true,
      author: true,
      tags: { include: { tag: true } },
      references: { orderBy: { displayOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || undefined,
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt || undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.coverImage ? [{ url: article.coverImage.url }] : undefined,
      authors: article.author.name ? [article.author.name] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const profile = await db.profile.findFirst();

  const related = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      OR: [
        article.categoryId ? { categoryId: article.categoryId } : {},
        { tags: { some: { tagId: { in: article.tags.map((t) => t.tagId) } } } },
      ],
    },
    take: 3,
    include: { coverImage: true, category: true, author: true },
  });

  const settings = await db.siteSettings.findFirst();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage?.url,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: settings?.siteName || "[PHARMACIST_NAME]",
    },
  };

  return (
    <article className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-prose pt-12">
        <Breadcrumbs
          items={[
            { label: "Articles", href: "/articles" },
            ...(article.category
              ? [{ label: article.category.name, href: `/articles?category=${article.category.slug}` }]
              : []),
            { label: article.title },
          ]}
        />

        {article.category && (
          <Link
            href={`/articles?category=${article.category.slug}`}
            className="eyebrow mt-8 inline-block text-primary"
          >
            {article.category.name}
          </Link>
        )}

        <h1 className="mt-4 text-display font-serif text-balance">{article.title}</h1>

        {article.excerpt && (
          <p className="mt-6 text-body-lg text-text-muted text-pretty">{article.excerpt}</p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4 border-b border-border pb-8 text-sm text-text-muted">
          <span>By {profile?.fullName || article.author.name}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt.toISOString()}>
                {formatDate(article.publishedAt)}
              </time>
            </>
          )}
          {article.readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{article.readingTime} min read</span>
            </>
          )}
        </div>
      </div>

      {article.coverImage && (
        <div className="container-content mt-8">
          <figure className="mx-auto max-w-3xl overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage.url}
              alt={article.coverImage.altText || article.title}
              className="h-auto w-full"
            />
          </figure>
          {article.coverImage.caption && (
            <p className="mx-auto mt-3 max-w-3xl text-center text-caption text-text-muted">
              {article.coverImage.caption}
            </p>
          )}
        </div>
      )}

      <div className="container-prose mt-12">
        <div
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.references.length > 0 && (
          <section className="mt-16 border-t border-border pt-8">
            <h2 className="text-heading-3 font-serif">References</h2>
            <ol className="mt-4 space-y-3 text-sm text-text-muted">
              {article.references.map((ref, idx) => (
                <li key={ref.id} className="flex gap-3">
                  <span className="text-text-muted">{idx + 1}.</span>
                  <div>
                    <span>{ref.title}</span>
                    {ref.source && <span className="italic"> — {ref.source}</span>}
                    {ref.url && (
                      <>
                        {" "}
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary link-underline break-all"
                        >
                          {ref.url}
                        </a>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {settings?.medicalDisclaimer && (
          <aside className="mt-12 rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
            <p className="font-medium text-text-primary">Medical Disclaimer</p>
            <p className="mt-2">{settings.medicalDisclaimer}</p>
          </aside>
        )}

        <div className="mt-16 border-t border-border pt-8">
          <AuthorCard />
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-content mt-24">
          <h2 className="text-heading-2 font-serif">Related Articles</h2>
          <div className="mt-8 grid gap-12 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}