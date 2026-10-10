"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/auth";
import { db } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = [
  "image/jpeg", "image/jpg", "image/png", "image/webp",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadMedia(formData: FormData) {
  const user = await requireEditor();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "No file provided." };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `File type ${file.type || "unknown"} is not allowed.` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File exceeds the ${MAX_FILE_SIZE / 1024 / 1024}MB limit.` };
  }

  const supabase = await createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const safeName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `uploads/${safeName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: `Upload failed: ${uploadError.message}` };

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(storagePath);

  const media = await db.media.create({
    data: {
      filename: file.name,
      storagePath,
      mimeType: file.type,
      size: file.size,
      url: publicUrl,
      uploadedBy: user.id,
    },
  });

  revalidatePath("/admin/media");
  return { success: true as const, media };
}

export async function listMedia(opts?: { type?: "image" | "pdf" | "all" }) {
  await requireEditor();
  const where =
    opts?.type === "image"
      ? { mimeType: { startsWith: "image/" } }
      : opts?.type === "pdf"
      ? { mimeType: "application/pdf" }
      : {};

  return db.media.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function updateMedia(id: string, formData: FormData) {
  await requireEditor();
  const altText = (formData.get("altText") as string | null)?.trim();
  const caption = (formData.get("caption") as string | null)?.trim();

  await db.media.update({
    where: { id },
    data: { altText: altText || null, caption: caption || null },
  });

  revalidatePath("/admin/media");
  return { success: true as const };
}

export async function deleteMedia(id: string) {
  await requireEditor();
  const media = await db.media.findUnique({ where: { id } });
  if (!media) return { error: "File not found." };

  const [articleCovers, articleOg, profilePhotos, cvs, expLogos, eduLogos, certMedia, defaultOg] =
    await Promise.all([
      db.article.count({ where: { coverImageId: id } }),
      db.article.count({ where: { ogImageId: id } }),
      db.profile.count({ where: { profilePhotoId: id } }),
      db.profile.count({ where: { cvMediaId: id } }),
      db.experience.count({ where: { logoId: id } }),
      db.education.count({ where: { logoId: id } }),
      db.certification.count({ where: { certificateMediaId: id } }),
      db.siteSettings.count({ where: { defaultOgImageId: id } }),
    ]);

  const totalRefs =
    articleCovers + articleOg + profilePhotos + cvs + expLogos + eduLogos + certMedia + defaultOg;

  if (totalRefs > 0) {
    return {
      error: `This file is used in ${totalRefs} place${totalRefs === 1 ? "" : "s"} on the website and cannot be deleted. Remove it from those places first.`,
    };
  }

  const supabase = await createClient();
  await supabase.storage.from("media").remove([media.storagePath]);
  await db.media.delete({ where: { id } });

  revalidatePath("/admin/media");
  return { success: true as const };
}