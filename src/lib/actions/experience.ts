"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { experienceSchema } from "@/lib/validation";

function emptyToUndefined(v: unknown) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" || s === null ? undefined : s;
}

export async function createExperience(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);

  const parsed = experienceSchema.safeParse({
    title: raw.title,
    organization: raw.organization,
    location: emptyToUndefined(raw.location),
    startDate: new Date(raw.startDate as string).toISOString(),
    endDate: emptyToUndefined(raw.endDate)
      ? new Date(raw.endDate as string).toISOString()
      : undefined,
    isCurrent: raw.isCurrent === "true",
    description: emptyToUndefined(raw.description),
    displayOrder: Number(raw.displayOrder) || 0,
    enabled: raw.enabled === "true",
  });

  if (!parsed.success) {
    // Surface the exact Zod issues in the server log so debugging is possible
    console.error("Experience validation failed:", parsed.error.flatten());
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.experience.create({ data: parsed.data });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/");
  return { success: true as const };
}

export async function updateExperience(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);

  const parsed = experienceSchema.safeParse({
    title: raw.title,
    organization: raw.organization,
    location: emptyToUndefined(raw.location),
    startDate: new Date(raw.startDate as string).toISOString(),
    endDate: emptyToUndefined(raw.endDate)
      ? new Date(raw.endDate as string).toISOString()
      : undefined,
    isCurrent: raw.isCurrent === "true",
    description: emptyToUndefined(raw.description),
    displayOrder: Number(raw.displayOrder) || 0,
    enabled: raw.enabled === "true",
  });

  if (!parsed.success) {
    console.error("Experience validation failed:", parsed.error.flatten());
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.experience.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/");
  return { success: true as const };
}

export async function deleteExperience(id: string) {
  await requireEditor();
  await db.experience.delete({ where: { id } });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  revalidatePath("/");
  return { success: true as const };
}

export async function reorderExperiences(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.experience.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  return { success: true as const };
}

export async function toggleExperience(id: string, enabled: boolean) {
  await requireEditor();
  await db.experience.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/experience");
  revalidatePath("/experience");
  return { success: true as const };
}