"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { educationSchema } from "@/lib/validation";

function emptyToUndefined(v: unknown) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" || s === null ? undefined : s;
}

export async function createEducation(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = educationSchema.safeParse({
    ...raw,
    endDate: emptyToUndefined(raw.endDate)
      ? new Date(raw.endDate as string).toISOString()
      : undefined,
    startDate: new Date(raw.startDate as string).toISOString(),
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.education.create({ data: parsed.data });
  revalidatePath("/admin/education");
  revalidatePath("/education");
  return { success: true as const };
}

export async function updateEducation(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = educationSchema.safeParse({
    ...raw,
    endDate: emptyToUndefined(raw.endDate)
      ? new Date(raw.endDate as string).toISOString()
      : undefined,
    startDate: new Date(raw.startDate as string).toISOString(),
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.education.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/education");
  revalidatePath("/education");
  return { success: true as const };
}

export async function deleteEducation(id: string) {
  await requireEditor();
  await db.education.delete({ where: { id } });
  revalidatePath("/admin/education");
  revalidatePath("/education");
  return { success: true as const };
}

export async function reorderEducation(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.education.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/education");
  revalidatePath("/education");
  return { success: true as const };
}

export async function toggleEducation(id: string, enabled: boolean) {
  await requireEditor();
  await db.education.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/education");
  revalidatePath("/education");
  return { success: true as const };
}