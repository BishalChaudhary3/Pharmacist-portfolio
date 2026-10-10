import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) return NextResponse.redirect(`${origin}/admin/login`);

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    return NextResponse.redirect(`${origin}/admin/login`);
  }

  // Sync user record (only create if it doesn't exist)
  const existing = await db.user.findUnique({ where: { supabaseId: user.id } });
  if (!existing) {
    await db.user.create({
      data: {
        supabaseId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        role: "EDITOR",
      },
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}