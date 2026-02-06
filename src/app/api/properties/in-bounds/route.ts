/*
ARCHIVO: src/app/api/properties/in-bounds/route.ts
CORRECCIÓN: Eliminada la selección de 'price' que no existe en la BD y uso de Prisma.PropertyWhereInput.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { OperationType, PropertyType, Prisma } from "@prisma/client";

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

  const hasWater = searchParams.get("hasWater") === "true";
  const hasElectricity = searchParams.get("hasElectricity") === "true";
  const hasGas = searchParams.get("hasGas") === "true";
  const hasInternet = searchParams.get("hasInternet") === "true";
  const hasParking = searchParams.get("hasParking") === "true";
  const hasPool = searchParams.get("hasPool") === "true";

  if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLon) || isNaN(maxLon)) {
    return NextResponse.json(
      { error: "Coordenadas inválidas" },
      { status: 400 },
    );
  }

  try {
    // CORRECCIÓN: Tipado de Prisma para evitar 'any'
    const whereClause: Prisma.PropertyWhereInput = {
      status: "AVAILABLE",
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
      whereClause.OR = [
        {
          salePrice: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        },
        {
          rentPrice: {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          },
        },
      ];
    }

    if (hasWater) whereClause.hasWater = true;
    if (hasElectricity) whereClause.hasElectricity = true;
    if (hasGas) whereClause.hasGas = true;
    if (hasInternet) whereClause.hasInternet = true;
    if (hasParking) whereClause.hasParking = true;
    if (hasPool) whereClause.hasPool = true;

    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        salePrice: true,
        rentPrice: true,
        // price: true, // Eliminado correctamente
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

        hasWater: true,
        hasElectricity: true,
        hasGas: true,
        hasInternet: true,
        hasParking: true,
        hasPool: true,
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error("Error fetching properties in bounds:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
