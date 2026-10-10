import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { AuthorCard } from "@/components/public/author-card";

export default async function PreviewArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [article, profile, settings] = await Promise.all([
        db.article.findUnique({
            where: { id },
            include: {
                coverImage: true,
                category: true,
                author: true,
                tags: { include: { tag: true } },
                references: { orderBy: { displayOrder: "asc" } },
            },
        }),
        db.profile.findFirst(),
        db.siteSettings.findFirst(),
    ]);

    if (!article) notFound();

    return (
        <>
            {/* Preview banner */}
            <div className="sticky top-0 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2">
                <div className="container-content flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="text-amber-900">
                        <strong>Preview</strong>
                        {article.status === "PUBLISHED"
                            ? " — This article is live."
                            : " — This is how the article will look when published. It is not publicly visible yet."}
                    </p>
                    <div className="flex gap-3">
                        <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="font-medium text-amber-900 hover:underline"
                        >
                            ← Back to editor
                        </Link>
                        {article.status === "PUBLISHED" && (
                            <a
                                href={`/articles/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-amber-900 hover:underline"
                            >
                                View live →
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <article className="pb-24">
                <div className="container-prose pt-12">
                    <Breadcrumbs
                        items={[
                            { label: "Articles", href: "/articles" },
                            ...(article.category
                                ? [
                                    {
                                        label: article.category.name,
                                        href: `/articles?category=${article.category.slug}`,
                                    },
                                ]
                                : []),
                            { label: article.title },
                        ]}
                    />

                    {article.category && (
                        <span className="eyebrow mt-8 inline-block text-primary">
                            {article.category.name}
                        </span>
                    )}

                    <h1 className="mt-4 text-display font-serif text-balance">
                        {article.title}
                    </h1>

                    {article.excerpt && (
                        <p className="mt-6 text-body-lg text-text-muted text-pretty">
                            {article.excerpt}
                        </p>
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
                                            {ref.source && (
                                                <span className="italic"> — {ref.source}</span>
                                            )}
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
            </article>
        </>
    );
}