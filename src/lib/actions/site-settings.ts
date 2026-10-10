"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import { siteSettingsSchema } from "@/lib/validation";

function emptyToUndefined(v: unknown) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" || s === null ? undefined : s;
}

export async function updateSiteSettings(formData: FormData) {
  await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = siteSettingsSchema.safeParse({
    siteName: raw.siteName,
    siteDescription: emptyToUndefined(raw.siteDescription),
    email: emptyToUndefined(raw.email),
    phone: emptyToUndefined(raw.phone),
    location: emptyToUndefined(raw.location),
    linkedin: emptyToUndefined(raw.linkedin),
    instagram: emptyToUndefined(raw.instagram),
    researchGate: emptyToUndefined(raw.researchGate),
    orcid: emptyToUndefined(raw.orcid),
    copyright: emptyToUndefined(raw.copyright),
    medicalDisclaimer: emptyToUndefined(raw.medicalDisclaimer),
    defaultSeoTitle: emptyToUndefined(raw.defaultSeoTitle),
    defaultSeoDescription: emptyToUndefined(raw.defaultSeoDescription),
  });

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await db.siteSettings.findFirst();

  if (existing) {
    await db.siteSettings.update({
      where: { id: existing.id },
      data: parsed.data,
    });
  } else {
    await db.siteSettings.create({ data: parsed.data });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin/seo");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true as const };
}