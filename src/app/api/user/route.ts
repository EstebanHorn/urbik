import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  getServerUserProfile,
  updateServerProfile,
} from "../../../features/profile/service/profileService";
import prisma from "@/libs/db";

type ProfileUpdatePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  agencyName?: string;
  name?: string;
  address?: string;
  website?: string;
  instagram?: string;
  bio?: string;
  province?: string;
  city?: string;
  licenses?: Array<{
    id?: number;
    licenseNumber: string;
    province: string;
    jurisdiction?: string | null;
    responsibleName: string;
    isPrimary?: boolean;
  }>;
  offices?: Array<{
    id?: number;
    name: string;
    province: string;
    city: string;
    street: string;
    number: string;
    phone?: string | null;
  }>;
};

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

    if (body.isActive === undefined) {
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

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
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

