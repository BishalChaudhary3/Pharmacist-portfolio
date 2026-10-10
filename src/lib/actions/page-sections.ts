"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEditor } from "@/lib/auth";
import type { Prisma } from "@/lib/prisma-types";

export async function reorderPageSections(orderedIds: string[]) {
  await requireEditor();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.pageSection.update({ where: { id }, data: { displayOrder: index } })
    )
  );
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return { success: true as const };
}

export async function togglePageSection(id: string, enabled: boolean) {
  await requireEditor();
  await db.pageSection.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return { success: true as const };
}

export async function updatePageSectionContent(
  id: string,
  content: Record<string, unknown>
) {
  await requireEditor();
  await db.pageSection.update({
    where: { id },
    data: { content: content as Prisma.InputJsonValue },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return { success: true as const };
}

export async function getPageSections(pageSlug: string) {
  await requireEditor();
  const page = await db.page.findUnique({
    where: { slug: pageSlug },
    include: {
      sections: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });
  return page?.sections ?? [];
}