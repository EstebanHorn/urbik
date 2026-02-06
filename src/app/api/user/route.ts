/*
Este código implementa un manejador de rutas de API en Next.js para la gestión del perfil de
usuario, proporcionando endpoints para obtener la información del perfil (GET), actualizar
campos específicos como el estado de actividad mediante Prisma (PATCH), realizar una actualización
integral de los datos personales (PUT) y eliminar la cuenta de forma permanente (DELETE). El script
asegura la integridad de las operaciones mediante la validación de la sesión con NextAuth, la
gestión de errores centralizada y la interacción directa con la base de datos a través de Prisma y
servicios externos de perfil, garantizando que solo los usuarios autenticados puedan acceder o
modificar su propia información.
*/
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  getServerUserProfile,
  updateServerProfile,
} from "../../../features/profile/service/profileService";
import prisma from "@/libs/db";

interface SessionUser {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user?: SessionUser;
}

interface UserProfile {
  name: string;
  lastName: string;
  phone: string;
  isActive?: boolean;
}

type ProfileUpdatePayload = Partial<UserProfile>;

function handleServiceError(err: unknown, status: number = 500): Response {
  const message = err instanceof Error ? err.message : "Error desconocido";
  console.error("Error en el servicio de perfil:", message);

  const responseBody = {
    error: message || "Error interno del servidor",
    detail: process.env.NODE_ENV === "development" ? message : undefined,
  };
  return new Response(JSON.stringify(responseBody), { status });
}

export async function GET(_req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
    });
  }

  try {
    const responseData = await getServerUserProfile(session.user.email);
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return handleServiceError(err, 500);
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "No autenticado o email faltante" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    console.log("3. Backend -> Email de sesión:", session.user.email);
    console.log("3. Backend -> Body recibido:", body);

    if (body.isActive === undefined) {
      console.error("3. Backend -> Error: isActive es undefined");
      return NextResponse.json(
        { error: "Campo isActive requerido" },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.allUsers.update({
      where: { email: session.user.email },
      data: {
        isActive: body.isActive,
      },
    });

    console.log("3. Backend -> Resultado de Prisma (DB):", updatedUser);

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (err) {
    console.error("3. Backend -> CRASH en Prisma:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}

export async function PUT(req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
    });
  }

  try {
    const body: ProfileUpdatePayload = await req.json();
    const updatedData = await updateServerProfile(session.user.email, body);

    return new Response(
      JSON.stringify({ message: "Perfil actualizado", updated: updatedData }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return handleServiceError(err, 500);
  }
}

export async function DELETE(_req: NextRequest): Promise<Response> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
    });
  }

  try {
    await prisma.allUsers.delete({
      where: { email: session.user.email },
    });

    return new Response(
      JSON.stringify({ message: "Cuenta eliminada correctamente" }),
      {
        status: 200,
      },
    );
  } catch (err) {
    return handleServiceError(err, 500);
  }
}
