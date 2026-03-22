import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

const authMiddleware = withAuth(
  function (req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/dashboard")) {
      const rolesAutorizados = ["ADMIN", "AGENT", "REALESTATE"];
      if (!token?.role || !rolesAutorizados.includes(token.role)) {
        return NextResponse.redirect(new URL("/", req.url)); // O a /login
      }
    }
  },
  {
    callbacks: {

      authorized: () => true, 
    },
  }
);

export default function middleware(req: NextRequest, event: NextFetchEvent) {

  const basicAuth = req.headers.get("authorization");
  
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PASSWORD;

  if (user && pwd) {
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [u, p] = atob(authValue).split(":");

      if (u === user && p === pwd) {
        return authMiddleware(req as NextRequestWithAuth, event);
      }
    }

    return new NextResponse("Zona Privada - Acceso Restringido", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Sitio Privado"' },
    });
  }

  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};