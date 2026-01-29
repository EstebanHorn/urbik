/*
Este código define una función de manejo de peticiones GET en Next.js que permite recuperar la lista de
propiedades favoritas de un usuario autenticado. El proceso comienza verificando la sesión del usuario
mediante NextAuth para garantizar la seguridad; si el usuario no está identificado, devuelve un error 401.
Una vez confirmada la identidad, utiliza el ORM Prisma para realizar una consulta en la base de datos que
busca todos los registros en la tabla de favoritos vinculados al ID del usuario, incluyendo los detalles
de cada propiedad asociada y ordenándolos de forma descendente por fecha de creación. Finalmente, el código
transforma esos datos para extraer únicamente los objetos de propiedad y los devuelve en formato JSON,
manejando cualquier posible fallo del servidor con un mensaje de error y un código de estado 500.
*/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import prisma from "@/libs/db"; 

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = Number(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId,
      },
      include: {
        property: true, 
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const favoriteProperties = favorites.map((fav) => fav.property);

    return NextResponse.json(favoriteProperties);
  } catch (error) {
    console.error("ERROR EN API FAVORITES (LIST):", error);
    return NextResponse.json({ error: "Error al obtener favoritos" }, { status: 500 });
  }
}