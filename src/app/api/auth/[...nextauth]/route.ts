/*
Este fragmento de código configura la lógica de autenticación para una aplicación Next.js
utilizando la librería NextAuth, permitiendo el inicio de sesión tanto a través de Google
como mediante credenciales personalizadas (email y contraseña). En el flujo de credenciales,
el sistema consulta una base de datos mediante Prisma para validar la existencia del usuario,
compara la contraseña encriptada usando bcryptjs y personaliza el nombre del perfil según el
rol del usuario (Agencia o Usuario final). Finalmente, utiliza una estrategia de tokens JWT y
funciones de callback para persistir y exponer información crítica, como el ID y el rol del
usuario, dentro de la sesión de la aplicación, redirigiendo los intentos de acceso no
autorizados a una página de login personalizada.
*/

import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/libs/db";
import type { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.allUsers.findUnique({
          where: { email: credentials.email },
          include: {
            userData: true,
            realEstate: true,
          },
        });

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        if (user.role === "REALESTATE" && user.status === "PENDING") {
          throw new Error(
            "Tu cuenta está en revisión. Te avisaremos cuando sea habilitada.",
          );
        }

        const displayName =
          user.role === "REALESTATE"
            ? user.realEstate?.agencyName
            : user.userData?.firstName;

        return {
          id: user.user_id.toString(),
          email: user.email,
          name: displayName || user.email.split("@")[0],
          role: user.role as Role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
