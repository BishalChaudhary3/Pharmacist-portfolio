"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { articleSchema } from "@/lib/validation";
import { calculateReadingTime, slugify } from "@/lib/utils";

function emptyToUndefined(v: unknown) {
  return v === "" || v === null ? undefined : v;
}

export async function createArticle(formData: FormData) {
  const user = await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = articleSchema.safeParse({
    ...raw,
    isFeatured: raw.isFeatured === "true" || raw.isFeatured === "on",
    featuredOrder: Number(raw.featuredOrder) || 0,
    tagIds: raw.tagIds ? JSON.parse(raw.tagIds as string) : [],
    ogImageId: emptyToUndefined(raw.ogImageId),
    scheduledAt: emptyToUndefined(raw.scheduledAt),
    seoTitle: emptyToUndefined(raw.seoTitle),
    seoDescription: emptyToUndefined(raw.seoDescription),
    canonicalUrl: emptyToUndefined(raw.canonicalUrl),
    categoryId: emptyToUndefined(raw.categoryId),
    coverImageId: emptyToUndefined(raw.coverImageId),
    excerpt: emptyToUndefined(raw.excerpt),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { tagIds, ...data } = parsed.data;
  const readingTime = calculateReadingTime(data.content);

  // Check slug uniqueness
  const existing = await db.article.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { errors: { slug: ["This slug is already in use. Please choose another."] } };
  }

  const article = await db.article.create({
    data: {
      ...data,
      readingTime,
      authorId: user.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      tags: tagIds && tagIds.length > 0 ? {
        create: tagIds.map((tagId) => ({ tagId })),
      } : undefined,
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
  redirect(`/admin/articles/${article.id}/edit`);
}

export async function updateArticle(id: string, formData: FormData) {
  await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = articleSchema.safeParse({
    ...raw,
    isFeatured: raw.isFeatured === "true" || raw.isFeatured === "on",
    featuredOrder: Number(raw.featuredOrder) || 0,
    tagIds: raw.tagIds ? JSON.parse(raw.tagIds as string) : [],
    ogImageId: emptyToUndefined(raw.ogImageId),
    scheduledAt: emptyToUndefined(raw.scheduledAt),
    seoTitle: emptyToUndefined(raw.seoTitle),
    seoDescription: emptyToUndefined(raw.seoDescription),
    canonicalUrl: emptyToUndefined(raw.canonicalUrl),
    categoryId: emptyToUndefined(raw.categoryId),
    coverImageId: emptyToUndefined(raw.coverImageId),
    excerpt: emptyToUndefined(raw.excerpt),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return { error: "Article not found" };

  // Check slug uniqueness against other articles
  if (parsed.data.slug !== existing.slug) {
    const conflict = await db.article.findUnique({ where: { slug: parsed.data.slug } });
    if (conflict) {
      return { errors: { slug: ["This slug is already in use."] } };
    }
    // Save redirect for old slug
    await db.redirect.create({
      data: { fromPath: `/articles/${existing.slug}`, toPath: `/articles/${parsed.data.slug}` },
    }).catch(() => { /* ignore if duplicate */ });
  }

  const { tagIds, ...data } = parsed.data;
  const readingTime = calculateReadingTime(data.content);

  // Save revision
  await db.articleRevision.create({
    data: {
      articleId: id,
      title: existing.title,
      content: existing.content,
      excerpt: existing.excerpt,
    },
  });

  await db.article.update({
    where: { id },
    data: {
      ...data,
      readingTime,
      publishedAt:
        existing.publishedAt ||
        (data.status === "PUBLISHED" ? new Date() : null),
      tags: {
        deleteMany: {},
        create: tagIds && tagIds.length > 0 ? tagIds.map((tagId) => ({ tagId })) : [],
      },
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}/edit`);
  revalidatePath("/articles");
  revalidatePath(`/articles/${data.slug}`);
  revalidatePath("/");

  return { success: true };
}

export async function deleteArticle(id: string) {
  await requireEditor();
  const article = await db.article.findUnique({ where: { id } });
  if (!article) return { error: "Article not found" };

  await db.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  revalidatePath("/");
  return { success: true };
}

export async function publishArticle(id: string) {
  await requireEditor();
  await db.article.update({
    where: { id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  return { success: true };
}