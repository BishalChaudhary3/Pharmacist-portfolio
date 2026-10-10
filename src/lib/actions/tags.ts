"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";

const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
});

export async function createTag(formData: FormData) {
  await requireEditor();
  const parsed = tagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await db.tag.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { errors: { slug: ["This slug is already in use."] } };

  await db.tag.create({ data: parsed.data });
  revalidatePath("/admin/tags");
  return { success: true as const };
}

export async function updateTag(id: string, formData: FormData) {
  await requireEditor();
  const parsed = tagSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const conflict = await db.tag.findFirst({
    where: { slug: parsed.data.slug, NOT: { id } },
  });
  if (conflict) return { errors: { slug: ["This slug is already in use."] } };

  await db.tag.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/tags");
  return { success: true as const };
}

export async function deleteTag(id: string) {
  await requireEditor();
  await db.tag.delete({ where: { id } });
  revalidatePath("/admin/tags");
  return { success: true as const };
}