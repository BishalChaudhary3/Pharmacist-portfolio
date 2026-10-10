import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session cookie. This is the ONLY job of the proxy.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (Next.js static files)
     *   - _next/image   (image optimization)
     *   - favicon.ico
     *   - image files (svg, png, jpg, jpeg, gif, webp)
     *   - /admin/login  ← the critical exclusion that breaks the loop
     */
    "/((?!_next/static|_next/image|favicon.ico|admin/login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};