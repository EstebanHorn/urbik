/*
Este código implementa un endpoint de API en Next.js que recupera las tres propiedades
disponibles más recientes de una base de datos mediante Prisma, integrando además una
verificación de estado de "favoritos" personalizada según la sesión del usuario. La
función obtiene los datos básicos de las propiedades y, si existe un usuario autenticado
a través de NextAuth, cruza esa información con la tabla de favoritos para marcar cada
propiedad con un booleano isFavorite antes de retornar la respuesta en formato JSON; en 
caso de que no haya una sesión activa, devuelve la lista de propiedades con dicho marcador
siempre en falso.
*/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from "@/libs/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const properties = await prisma.property.findMany({
      take: 3,
      where: {
        status: "AVAILABLE",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        price: true,
        operationType: true,
        address: true,
        city: true,
        images: true,
        rooms: true,
        bathrooms: true,
        area: true,
        type: true,
      },
    });

    if (!session || !session.user) {
      return NextResponse.json(
        properties.map((prop) => ({ ...prop, isFavorite: false }))
      );
    }

    const userId = Number(session.user.id);
    const propertyIds = properties.map((p) => p.id);

    const userFavorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
        propertyId: { in: propertyIds },
      },
      select: {
        propertyId: true,
      },
    });

    const favoriteIds = new Set(userFavorites.map((fav) => fav.propertyId));

    const propertiesWithFavorites = properties.map((prop) => ({
      ...prop,
      isFavorite: favoriteIds.has(prop.id),
    }));

    return NextResponse.json(propertiesWithFavorites);
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return NextResponse.json(
      { error: "Error al obtener propiedades destacadas" },
      { status: 500 }
    );
  }
}