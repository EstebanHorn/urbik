import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import error from "./app/error";

export async function middleware(request: NextRequest) {
  const basicAuth = request.headers.get("authorization");
  const userEnv = process.env.BASIC_AUTH_USER;
  const pwdEnv = process.env.BASIC_AUTH_PASSWORD;

  if (userEnv && pwdEnv) {
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [u, p] = atob(authValue).split(":");

      if (u !== userEnv || p !== pwdEnv) {
        return new NextResponse("Zona Privada - Acceso Restringido", {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Sitio Privado"' },
        });
      }
    } else {
      return new NextResponse("Zona Privada - Acceso Restringido", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Sitio Privado"' },
      });
    }
  }

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

  const path = request.nextUrl.pathname;
  const isProtectedPath = path.startsWith("/administrate") || path.startsWith("/dashboard");

  if (isProtectedPath) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = profile?.role;

    if (path.startsWith("/administrate") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (path.startsWith("/dashboard")) {
      const rolesAutorizados = ["AGENT", "REALESTATE"];
      if (!userRole || !rolesAutorizados.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};