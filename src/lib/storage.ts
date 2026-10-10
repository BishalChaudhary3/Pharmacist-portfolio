import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_PDF_TYPES = ["application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadFile(
  file: File,
  userId: string,
  options?: { allowedTypes?: string[]; maxSize?: number }
) {
  const allowedTypes = options?.allowedTypes ?? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES];
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed.`);
  }

  if (file.size > maxSize) {
    throw new Error(`File size exceeds the maximum of ${maxSize / 1024 / 1024}MB.`);
  }

  const supabase = await createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const storagePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(storagePath, file);

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("media")
    .getPublicUrl(storagePath);

  const media = await db.media.create({
    data: {
      filename: file.name,
      storagePath,
      mimeType: file.type,
      size: file.size,
      url: publicUrl,
      uploadedBy: userId,
    },
  });

  return media;
}

export async function deleteFile(mediaId: string) {
  const media = await db.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new Error("Media not found");

  // Check if media is referenced anywhere
  const references = await Promise.all([
    db.article.count({ where: { coverImageId: mediaId } }),
    db.article.count({ where: { ogImageId: mediaId } }),
    db.profile.count({ where: { profilePhotoId: mediaId } }),
    db.profile.count({ where: { cvMediaId: mediaId } }),
    db.experience.count({ where: { logoId: mediaId } }),
    db.education.count({ where: { logoId: mediaId } }),
    db.certification.count({ where: { certificateMediaId: mediaId } }),
    db.siteSettings.count({ where: { defaultOgImageId: mediaId } }),
  ]);

  const totalRefs = references.reduce((a, b) => a + b, 0);
  if (totalRefs > 0) {
    throw new Error(`This file is in use by ${totalRefs} item(s) and cannot be deleted.`);
  }

  const supabase = await createClient();
  await supabase.storage.from("media").remove([media.storagePath]);
  await db.media.delete({ where: { id: mediaId } });
}