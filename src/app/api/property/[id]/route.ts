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
import { Prisma } from "@prisma/client";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await req.json();

    console.log("LOG: Iniciando UPDATE para ID:", id);
    console.log("LOG: Payload recibido:", JSON.stringify(body, null, 2));

    const userAccount = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
    });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property || !userAccount) {
      console.log("LOG: Propiedad o Usuario no encontrado");
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const isOwner = property.realEstateId === userAccount.user_id;
    const isAdmin = userAccount.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      console.log("LOG: No autorizado");
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updateData: Prisma.PropertyUpdateInput = {
      title: body.title,
      description: body.description,
      status: body.status,
      operationType: body.operationType,
      area: body.area ? Number(body.area) : undefined,
      rooms: body.rooms ? Number(body.rooms) : undefined,
      bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
      images: body.images,
      salePrice:
        body.salePrice !== undefined ? Number(body.salePrice) : undefined,
      rentPrice:
        body.rentPrice !== undefined ? Number(body.rentPrice) : undefined,
    };

    // CORRECCIÓN: Usamos Record<string, unknown> en lugar de any para iterar de forma segura
    const safeUpdateData = updateData as Record<string, unknown>;

    Object.keys(safeUpdateData).forEach((key) => {
      if (safeUpdateData[key] === undefined) {
        delete safeUpdateData[key];
      }
    });

    console.log("LOG: Datos preparados para Prisma:", updateData);

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    console.log("LOG: Actualización exitosa");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("ERROR CRÍTICO EN PUT PROPERTY:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error interno", message: message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
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
