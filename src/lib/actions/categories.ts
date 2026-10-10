"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().default(0),
});

export async function createCategory(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = categorySchema.safeParse({
    ...raw,
    description: raw.description || undefined,
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await db.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { errors: { slug: ["This slug is already in use."] } };

  await db.category.create({ data: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/articles");
  return { success: true as const };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = categorySchema.safeParse({
    ...raw,
    description: raw.description || undefined,
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const conflict = await db.category.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflict) return { errors: { slug: ["This slug is already in use."] } };

  await db.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/articles");
  return { success: true as const };
}

export async function deleteCategory(id: string) {
  await requireEditor();
  const count = await db.article.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      error: `${count} article${count === 1 ? " uses" : "s use"} this category. Reassign them first.`,
    };
  }
  await db.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/articles");
  return { success: true as const };
}