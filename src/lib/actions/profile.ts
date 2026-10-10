"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileSchema } from "@/lib/validation";

function emptyToUndefined(v: unknown) {
  const s = typeof v === "string" ? v.trim() : v;
  return s === "" || s === null ? undefined : s;
}

export async function updateProfile(formData: FormData) {
  await requireEditor();

  const raw = Object.fromEntries(formData);
  const parsed = profileSchema.safeParse({
    ...raw,
    shortBio: emptyToUndefined(raw.shortBio),
    longBio: emptyToUndefined(raw.longBio),
    email: emptyToUndefined(raw.email),
    phone: emptyToUndefined(raw.phone),
    location: emptyToUndefined(raw.location),
    linkedinUrl: emptyToUndefined(raw.linkedinUrl),
    instagramUrl: emptyToUndefined(raw.instagramUrl),
    researchGateUrl: emptyToUndefined(raw.researchGateUrl),
    orcidUrl: emptyToUndefined(raw.orcidUrl),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const profilePhotoId = emptyToUndefined(raw.profilePhotoId) as string | undefined;
  const cvMediaId = emptyToUndefined(raw.cvMediaId) as string | undefined;

  const existing = await db.profile.findFirst();

  if (existing) {
    await db.profile.update({
      where: { id: existing.id },
      data: {
        ...parsed.data,
        profilePhotoId: profilePhotoId ?? null,
        cvMediaId: cvMediaId ?? null,
      },
    });
  } else {
    await db.profile.create({
      data: {
        ...parsed.data,
        profilePhotoId: profilePhotoId ?? null,
        cvMediaId: cvMediaId ?? null,
      },
    });
  }

  revalidatePath("/admin/profile");
  revalidatePath("/");
  revalidatePath("/about");
  return { success: true as const };
}