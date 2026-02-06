/*
Este código define una ruta de API en Next.js que consulta una base de datos mediante
Prisma para obtener propiedades disponibles que posean datos geométricos, transformando
luego dicha información en un objeto con formato GeoJSON. El proceso filtra los registros
que contienen geometría válida y mapea sus atributos técnicos (CCA y PDA) en la estructura
de propiedades de una colección de características (FeatureCollection), la cual es devuelta
como una respuesta JSON para ser consumida generalmente por aplicaciones de mapas o sistemas
de información geográfica.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { Prisma } from "@prisma/client"; // Importamos Prisma para usar DbNull si es necesario

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        // CORRECCIÓN 1: Usamos 'status' en lugar de 'isAvailable'
        status: "AVAILABLE",
        // CORRECCIÓN 2: Filtrado estricto para JSON no nulo
        parcelGeom: {
          not: Prisma.DbNull,
        },
      },
      select: {
        parcelGeom: true,
        parcelCCA: true,
        parcelPDA: true,
      },
    });

    const features = properties
      // Validación extra en JS por si acaso
      .filter((p) => p.parcelGeom && typeof p.parcelGeom === "object")
      .map((p) => ({
        type: "Feature",
        geometry: p.parcelGeom,
        properties: {
          CCA: p.parcelCCA,
          PDA: p.parcelPDA,
        },
      }));

    return NextResponse.json({
      type: "FeatureCollection",
      features,
    });
  } catch (error) {
    console.error("Error en /api/parcels:", error);
    return NextResponse.json(
      { type: "FeatureCollection", features: [] },
      { status: 500 },
    );
  }
}
