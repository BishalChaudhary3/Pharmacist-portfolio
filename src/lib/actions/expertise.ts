"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { expertiseSchema } from "@/lib/validation";

export async function createExpertise(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = expertiseSchema.safeParse({
    ...raw,
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.expertise.create({ data: parsed.data });
  revalidatePath("/admin/expertise");
  revalidatePath("/");
  return { success: true as const };
}

export async function updateExpertise(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = expertiseSchema.safeParse({
    ...raw,
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.expertise.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/expertise");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteExpertise(id: string) {
  await requireEditor();
  await db.expertise.delete({ where: { id } });
  revalidatePath("/admin/expertise");
  revalidatePath("/");
  return { success: true as const };
}

export async function reorderExpertise(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.expertise.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/expertise");
  revalidatePath("/");
  return { success: true as const };
}

export async function toggleExpertise(id: string, enabled: boolean) {
  await requireEditor();
  await db.expertise.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/expertise");
  revalidatePath("/");
  return { success: true as const };
}