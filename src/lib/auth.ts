import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { supabaseId: session.id },
  });

  return user;
});

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export async function requireEditor() {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    throw new Error("Forbidden: Editor access required");
  }
  return user;
}