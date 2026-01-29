/*
Este código define un manejador de rutas de API para Next.js que gestiona las solicitudes de
alta de inmobiliarias mediante dos métodos: el método GET consulta la base de datos a través
de Prisma para obtener y devolver una lista de todos los usuarios con el rol "REALESTATE" y
estado "PENDING", incluyendo su información detallada relacionada; por otro lado, el método
PATCH recibe el identificador de un usuario y una acción específica para procesar dicha solicitud,
permitiendo actualizar el estado del usuario a "APPROVED" o eliminar el registro permanentemente
de la tabla "allUsers" según sea el caso, retornando finalmente una confirmación de éxito en formato
JSON.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";

export async function GET() {
  const pendingRealEstates = await prisma.allUsers.findMany({
    where: {
      role: "REALESTATE",
      status: "PENDING",
    },
    include: {
      realEstate: true,
    },
  });
  return NextResponse.json(pendingRealEstates);
}

export async function PATCH(req: Request) {
  const { userId, action } = await req.json();

  if (action === "APPROVE") {
    await prisma.allUsers.update({
      where: { user_id: userId },
      data: { status: "APPROVED" },
    });
  } else if (action === "DELETE") {
    await prisma.allUsers.delete({
      where: { user_id: userId },
    });
  }

  return NextResponse.json({ success: true });
}