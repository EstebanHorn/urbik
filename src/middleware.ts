import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

// 1. Configuración de NextAuth (Lógica interna de la app)
const authMiddleware = withAuth(
  function (req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Regla: Solo ADMIN puede ver /admin
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Regla: Solo roles específicos pueden ver /dashboard
    if (path.startsWith("/dashboard")) {
      const rolesAutorizados = ["ADMIN", "AGENT", "REALESTATE"];
      if (!token?.role || !rolesAutorizados.includes(token.role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // --- CORRECCIÓN CRÍTICA ---
        // Evitamos el bucle infinito permitiendo el acceso a /login y / (Home)
        // para que el usuario pueda intentar iniciar sesión.

        // 1. Si el usuario va al Login, lo dejamos pasar (si no, nunca podrá loguearse)
        if (req.nextUrl.pathname === "/login") {
          return true;
        }

        // 2. Si quieres que el Home sea visible para todos (dentro del Basic Auth), descomenta esto:
        // if (req.nextUrl.pathname === "/") {
        //   return true;
        // }

        // 3. Para el resto de rutas, exigimos estar logueado en NextAuth
        return !!token;
      },
    },
  },
);

// 2. Middleware Principal (Entry Point)
export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // --- ZONA DE BASIC AUTH (Capa de Seguridad Externa) ---
  // El 'if (true)' fuerza que esto funcione en Local y en Producción.
  if (true) {
    const basicAuth = req.headers.get("authorization");

    // Estas variables DEBEN estar en tu .env
    const user = process.env.BASIC_AUTH_USER;
    const pwd = process.env.BASIC_AUTH_PASSWORD;

    if (user && pwd) {
      if (basicAuth) {
        const authValue = basicAuth.split(" ")[1];
        const [u, p] = atob(authValue).split(":");

        if (u === user && p === pwd) {
          // Si la contraseña del sitio es correcta, pasamos el control a NextAuth
          return authMiddleware(req as NextRequestWithAuth, event);
        }
      }

      // Si no hay credenciales o son incorrectas, mostramos el prompt del navegador
      return new NextResponse("Zona Privada - Acceso Restringido", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Sitio Privado"' },
      });
    }
  }

  // Fallback por si no hay variables de entorno configuradas
  return authMiddleware(req as NextRequestWithAuth, event);
}

// 3. Matcher Global
export const config = {
  // Protege TODAS las rutas excepto archivos estáticos y APIs internas
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
