/*
Este código implementa un endpoint de API en Next.js utilizando Prisma para gestionar
operaciones CRUD sobre una entidad de propiedades, permitiendo consultar una propiedad
específica por su ID mediante el método GET (incluyendo datos de la inmobiliaria asociada),
actualizar sus campos y estado de disponibilidad a través de PUT, o removerla de la base de
datos mediante DELETE. Las funciones de actualización y eliminación incluyen una capa de seguridad
crítica que verifica la sesión del usuario mediante NextAuth y valida que el solicitante sea
efectivamente el propietario del registro antes de permitir cualquier modificación, devolviendo
respuestas en formato JSON con los códigos de estado HTTP correspondientes para manejar errores
de validación, autorización o fallos internos del servidor.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await req.json();

    const userAccount = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
    });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property || !userAccount) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const isOwner = property.realEstateId === userAccount.user_id;
    const isAdmin = userAccount.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updateData: any = {};
    if (body.status) {
      updateData.status = body.status;
    } else {
      updateData.title = body.title;
      updateData.description = body.description;
      updateData.price = Number(body.price);
      updateData.status = body.isAvailable ? "AVAILABLE" : "PAUSED";
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error en PUT property:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const userAccount = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
    });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property || !userAccount) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const isOwner = property.realEstateId === userAccount.user_id;
    const isAdmin = userAccount.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: "Propiedad eliminada correctamente" });
  } catch (error) {
    console.error("Error en DELETE property:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}