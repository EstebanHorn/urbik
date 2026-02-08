import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

const authMiddleware = withAuth(
  function (req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lógica de protección por Roles (Solo afecta si entras a estas rutas)
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
      // CORRECCIÓN CLAVE:
      // Devolvemos 'true' para permitir que el middleware se ejecute siempre.
      // Así, NextAuth NO fuerza el login en la Home.
      // La protección real de rutas la hacen los "if" de arriba.
      authorized: () => true, 
    },
  }
);

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  
  // --- CAPA 1: BASIC AUTH (Protección del Despliegue) ---
  // Si no pasas esto, no ves NADA.
  const basicAuth = req.headers.get("authorization");
  
  // Asegúrate de tener esto en tu .env
  const user = process.env.BASIC_AUTH_USER;
  const pwd = process.env.BASIC_AUTH_PASSWORD;

  // Solo activamos Basic Auth si las variables existen (Prod/Dev según configures)
  if (user && pwd) {
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [u, p] = atob(authValue).split(":");

      if (u === user && p === pwd) {
        // Pasó la seguridad del despliegue -> Entra a la lógica de la App
        return authMiddleware(req as NextRequestWithAuth, event);
      }
    }

    // Si falla el usuario/pass del despliegue
    return new NextResponse("Zona Privada - Acceso Restringido", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Sitio Privado"' },
    });
  }

  // Si no hay variables configuradas, pasa directo
  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  // Protege todo, menos los assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};