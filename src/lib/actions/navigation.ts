"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";

const navItemSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  url: z.string().min(1, "URL is required").max(200),
  isExternal: z.boolean().default(false),
  enabled: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

function validateUrl(url: string, isExternal: boolean): string | null {
  if (!isExternal && !url.startsWith("/") && !url.startsWith("#")) {
    return "Internal URLs must start with / or #";
  }
  if (isExternal && !/^https?:\/\//.test(url)) {
    return "External URLs must start with http:// or https://";
  }
  return null;
}

export async function createNavigationItem(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const isExternal = raw.isExternal === "true";
  const url = raw.url as string;
  const urlError = validateUrl(url, isExternal);
  if (urlError) return { errors: { url: [urlError] } };

  const parsed = navItemSchema.safeParse({
    ...raw,
    isExternal,
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.navigationItem.create({ data: parsed.data });
  revalidatePath("/admin/navigation");
  revalidatePath("/");
  return { success: true as const };
}

export async function updateNavigationItem(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const isExternal = raw.isExternal === "true";
  const url = raw.url as string;
  const urlError = validateUrl(url, isExternal);
  if (urlError) return { errors: { url: [urlError] } };

  const parsed = navItemSchema.safeParse({
    ...raw,
    isExternal,
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.navigationItem.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/navigation");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteNavigationItem(id: string) {
  await requireEditor();
  await db.navigationItem.delete({ where: { id } });
  revalidatePath("/admin/navigation");
  revalidatePath("/");
  return { success: true as const };
}

export async function reorderNavigationItems(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.navigationItem.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/navigation");
  revalidatePath("/");
  return { success: true as const };
}

export async function toggleNavigationItem(id: string, enabled: boolean) {
  await requireEditor();
  await db.navigationItem.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/navigation");
  revalidatePath("/");
  return { success: true as const };
}