import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (path.startsWith("/dashboard")) {
      const rolesAutorizados = ["ADMIN", "AGENT", "REALESTATE"];
      if (!token?.role || !rolesAutorizados.includes(token.role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
};