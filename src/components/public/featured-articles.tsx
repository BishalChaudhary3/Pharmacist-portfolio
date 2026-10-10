"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface Article {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  readingTime: number | null;
  coverImage: { url: string; altText: string | null } | null;
  category: { name: string; slug: string } | null;
  author: { name: string | null };
}

interface FeaturedArticlesProps {
  articles: Article[];
  content: Record<string, unknown>;
}

export function FeaturedArticles({ articles, content }: FeaturedArticlesProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const total = articles.length;

  const heading = (content.heading as string) || "Selected Writing";
  const description =
    (content.description as string) ||
    "Evidence-based perspectives on medicines, pharmacy, and healthcare.";

  const next = useCallback(() => {
    setActive((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActive((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (paused || isMobile || total <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, paused, isMobile, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  if (total === 0) return null;

  return (
    <section className="section-padding bg-surface">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Articles</p>
            <h2 className="mt-4 text-display-sm font-serif text-balance">
              {heading}
            </h2>
            <p className="mt-4 text-body text-text-muted">{description}</p>
          </div>
          <Link
            href="/articles"
            className="text-sm font-medium text-primary link-underline"
          >
            View all articles →
          </Link>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slides viewport */}
          <div
            className="relative h-[260px] overflow-hidden rounded-lg bg-primary/20 sm:h-[320px] lg:h-[380px]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured articles"
          >
            {articles.map((article, idx) => {
              const isActive = idx === active;
              return (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-out",
                    isActive
                      ? "opacity-100"
                      : "pointer-events-none opacity-0"
                  )}
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}
                >
                  {article.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImage.url}
                      alt={article.coverImage.altText || article.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
                  )}

                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent"
                  />

                  <div className="relative flex h-full flex-col justify-end p-5 sm:p-8 lg:p-10">
                    <div className="max-w-xl">
                      {article.category && (
                        <span className="eyebrow text-accent">
                          {article.category.name}
                        </span>
                      )}
                      <h3 className="mt-2 text-balance font-serif text-xl text-white sm:text-2xl lg:text-3xl">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-3 hidden max-w-lg text-sm text-white/80 line-clamp-2 sm:block">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-3 text-xs text-white/70">
                        {article.publishedAt && (
                          <time>{formatDate(article.publishedAt)}</time>
                        )}
                        {article.readingTime && (
                          <>
                            <span aria-hidden>·</span>
                            <span>{article.readingTime} min read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Controls overlay — sits above slides; wrapper lets clicks through, buttons don't */}
            {total > 1 && (
              <div className="pointer-events-none absolute inset-0 z-30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prev();
                  }}
                  className="pointer-events-auto absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-card backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:left-4"
                  aria-label="Previous article"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    next();
                  }}
                  className="pointer-events-auto absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-card backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:right-4"
                  aria-label="Next article"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute right-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm sm:right-5 sm:top-5">
                  {active + 1} / {total}
                </div>
              </div>
            )}
          </div>

          {/* Dots */}
          {total > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              {articles.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActive(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === active}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    idx === active
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}