"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";

export async function markMessageAsRead(id: string) {
  await requireEditor();
  await db.contactMessage.update({ where: { id }, data: { status: "READ" } });
  revalidatePath("/admin/messages");
  return { success: true as const };
}

export async function archiveMessage(id: string) {
  await requireEditor();
  await db.contactMessage.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/admin/messages");
  return { success: true as const };
}

export async function unarchiveMessage(id: string) {
  await requireEditor();
  await db.contactMessage.update({ where: { id }, data: { status: "READ" } });
  revalidatePath("/admin/messages");
  return { success: true as const };
}

export async function deleteMessage(id: string) {
  await requireEditor();
  await db.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { success: true as const };
}