/*
Este código define una ruta de API en Next.js que gestiona la lógica de "favoritos" mediante un
mecanismo de conmutación (toggle): primero verifica la autenticación del usuario a través de NextAuth,
extrae el identificador de una propiedad desde el cuerpo de la solicitud y, utilizando Prisma como ORM,
busca si ya existe una relación previa entre ese usuario y dicha propiedad en la base de datos; si la 
relación existe, la elimina (quita de favoritos), y si no existe, crea un nuevo registro (agrega a favoritos),
devolviendo en ambos casos una respuesta JSON que confirma el estado final de la operación o gestiona posibles
errores de validación y servidor.
*/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from "@/libs/db"; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { propertyId } = await req.json();
    const userId = Number(session.user.id);

    if (!propertyId) {
      return NextResponse.json({ error: "Falta el ID de la propiedad" }, { status: 400 });
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: userId,
          propertyId: Number(propertyId),
        },
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return NextResponse.json({ message: "Eliminado de favoritos", isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: userId,
          propertyId: Number(propertyId),
        },
      });
      return NextResponse.json({ message: "Guardado en favoritos", isFavorite: true });
    }
  } catch (error) {
    console.error("ERROR EN API FAVORITE:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}