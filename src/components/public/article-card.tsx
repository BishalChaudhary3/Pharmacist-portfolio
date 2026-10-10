import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    readingTime: number | null;
    coverImage: { url: string; altText: string | null } | null;
    category: { name: string; slug: string } | null;
    author: { name: string | null };
  };
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article
      className={
        featured
          ? "group grid gap-8 md:grid-cols-2 md:items-center"
          : "group flex flex-col"
      }
    >
      <Link
        href={`/articles/${article.slug}`}
        className={featured ? "relative aspect-[16/10] overflow-hidden rounded-lg bg-secondary/10" : "relative aspect-[16/10] overflow-hidden rounded-lg bg-secondary/10"}
      >
        {article.coverImage ? (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.altText || article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-muted">
            No cover image
          </div>
        )}
      </Link>

      <div className={featured ? "" : "mt-5"}>
        {article.category && (
          <Link
            href={`/articles?category=${article.category.slug}`}
            className="eyebrow text-primary hover:underline"
          >
            {article.category.name}
          </Link>
        )}
        <h3
          className={
            featured
              ? "mt-3 text-heading-1 font-serif text-balance"
              : "mt-2 text-heading-3 font-serif text-balance"
          }
        >
          <Link href={`/articles/${article.slug}`} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="mt-3 text-sm text-text-muted text-pretty line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
          {article.publishedAt && <time>{formatDate(article.publishedAt)}</time>}
          {article.readingTime && (
            <>
              <span aria-hidden>·</span>
              <span>{article.readingTime} min read</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}