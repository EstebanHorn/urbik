/*
Este código define un manejador de ruta de API en Next.js que realiza una consulta asincrónica 
a una base de datos mediante el ORM Prisma para obtener una lista de propiedades disponibles.
Específicamente, filtra los registros que tienen el campo isAvailable como verdadero y que poseen
coordenadas geográficas válidas (latitude y longitude no nulas), seleccionando únicamente los
campos esenciales para su visualización en un mapa —como ubicación, precio y tipo de operación
y devolviendo finalmente estos datos en formato JSON con un manejo de errores básico que responde
con un código de estado 500 en caso de fallo.
*/
import { NextResponse } from "next/server";
import prisma from "@/libs/db";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: "AVAILABLE",
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        salePrice: true,
        rentPrice: true,
        saleCurrency: true,
        rentCurrency: true,

        latitude: true,
        longitude: true,
        city: true,
        province: true,
        operationType: true,
        type: true,
        parcelCCA: true,
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties for map:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
