"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { certificationSchema } from "@/lib/validation";

function emptyToUndefined(v: unknown) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" || s === null ? undefined : s;
}

export async function createCertification(formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = certificationSchema.safeParse({
    ...raw,
    issueDate: new Date(raw.issueDate as string).toISOString(),
    expiryDate: emptyToUndefined(raw.expiryDate)
      ? new Date(raw.expiryDate as string).toISOString()
      : undefined,
    credentialUrl: emptyToUndefined(raw.credentialUrl),
    credentialId: emptyToUndefined(raw.credentialId),
    description: emptyToUndefined(raw.description),
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const certificateMediaId = emptyToUndefined(raw.certificateMediaId) as string | undefined;

  await db.certification.create({
    data: { ...parsed.data, certificateMediaId: certificateMediaId ?? null },
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/education");
  return { success: true as const };
}

export async function updateCertification(id: string, formData: FormData) {
  await requireEditor();
  const raw = Object.fromEntries(formData);
  const parsed = certificationSchema.safeParse({
    ...raw,
    issueDate: new Date(raw.issueDate as string).toISOString(),
    expiryDate: emptyToUndefined(raw.expiryDate)
      ? new Date(raw.expiryDate as string).toISOString()
      : undefined,
    credentialUrl: emptyToUndefined(raw.credentialUrl),
    credentialId: emptyToUndefined(raw.credentialId),
    description: emptyToUndefined(raw.description),
    enabled: raw.enabled === "true",
    displayOrder: Number(raw.displayOrder) || 0,
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const certificateMediaId = emptyToUndefined(raw.certificateMediaId) as string | undefined;

  await db.certification.update({
    where: { id },
    data: { ...parsed.data, certificateMediaId: certificateMediaId ?? null },
  });

  revalidatePath("/admin/certifications");
  revalidatePath("/education");
  return { success: true as const };
}

export async function deleteCertification(id: string) {
  await requireEditor();
  await db.certification.delete({ where: { id } });
  revalidatePath("/admin/certifications");
  revalidatePath("/education");
  return { success: true as const };
}

export async function reorderCertifications(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.certification.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/certifications");
  return { success: true as const };
}

export async function toggleCertification(id: string, enabled: boolean) {
  await requireEditor();
  await db.certification.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/certifications");
  revalidatePath("/education");
  return { success: true as const };
}