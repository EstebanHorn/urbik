/*
Este código define una ruta de API en Next.js que implementa un buscador de sugerencias
combinando datos internos y externos: primero valida que la consulta tenga al menos dos
caracteres y luego realiza una búsqueda concurrente en la base de datos local (vía Prisma)
para encontrar hasta tres inmobiliarias cuyo nombre coincida con el texto, integrando
simultáneamente hasta seis resultados de localización geográfica obtenidos desde la API
de OpenStreetMap (Nominatim) limitados a Argentina. Finalmente, el manejador unifica ambos
conjuntos de resultados en un único arreglo de objetos con formatos estandarizados según su
tipo ("REALESTATE_USER" o "ADDRESS") y lo retorna como una respuesta JSON, incluyendo un manejo
de errores básico que devuelve una lista vacía en caso de fallos.
*/
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/db";

interface OsmResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const dbResults = await prisma.allUsers.findMany({
      where: {
        role: "REALESTATE",
        OR: [
          {
            realEstate: {
              agencyName: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      include: { realEstate: true },
      take: 3,
    });

    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ar&addressdetails=1&limit=6`,
      { headers: { "User-Agent": "Urbik-App-v2" } },
    );

    const osmResults = (await osmResponse.json()) as OsmResult[];

    const suggestions = [
      ...dbResults.map((user) => ({
        type: "REALESTATE_USER",
        id: user.user_id,
        display_name: user.realEstate?.agencyName || user.email,
      })),
      ...osmResults.map((res) => ({
        type: "ADDRESS",
        id: res.place_id,
        display_name: res.display_name,
        lat: res.lat,
        lon: res.lon,
      })),
    ];

    return NextResponse.json({ suggestions });
  } catch (_error) {
    console.error("Search error:", _error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
