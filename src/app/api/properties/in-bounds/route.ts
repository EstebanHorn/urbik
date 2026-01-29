/*
Este código define un manejador de ruta GET en Next.js que consulta una base de datos mediante
Prisma para buscar propiedades disponibles dentro de un área geográfica específica definida por
coordenadas de latitud y longitud. El script extrae parámetros de búsqueda de la URL (incluyendo
ubicación, tipo de operación, tipo de propiedad, cantidad mínima de habitaciones y rango de precios),
valida que las coordenadas sean numéricas y construye dinámicamente una cláusula de filtrado para
retornar un listado JSON con los detalles técnicos y espaciales de los inmuebles que coincidan con
dichos criterios.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { OperationType, PropertyType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");
  const operationType = searchParams.get("operationType");
  const propertyType = searchParams.get("propertyType");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rooms = searchParams.get("rooms");

  if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLon) || isNaN(maxLon)) {
    return NextResponse.json(
      { error: "Coordenadas inválidas" },
      { status: 400 }
    );
  }

  try {
    const whereClause: any = {
      status: 'AVAILABLE',
      latitude: {
        gte: minLat,
        lte: maxLat,
      },
      longitude: {
        gte: minLon,
        lte: maxLon,
      },
    };

    if (operationType) {
      whereClause.operationType = operationType as OperationType;
    }

    if (propertyType) {
      whereClause.type = propertyType as PropertyType;
    }

    if (rooms) {
      whereClause.rooms = {
        gte: parseInt(rooms),
      };
    }

    if (minPrice || maxPrice) {
      whereClause.price = {
        ...(minPrice && { gte: parseFloat(minPrice) }),
        ...(maxPrice && { lte: parseFloat(maxPrice) }),
      };
    }

    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        price: true,
        latitude: true,
        longitude: true,
        city: true,
        province: true,
        operationType: true,
        type: true,
        parcelCCA: true,
        parcelGeom: true,
        images: true,
        address: true,
        rooms: true,
        area: true,
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties in bounds:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}