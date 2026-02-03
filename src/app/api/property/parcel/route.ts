/*
Este fragmento de código define un punto de entrada de API mediante el método POST en Next.js
para gestionar la creación de propiedades (específicamente parcelas o terrenos) en una base
de datos a través de Prisma. El proceso comienza verificando la sesión del usuario para
garantizar que esté autenticado; luego, valida que dicho usuario posea un perfil de inmobiliaria
asociado, restringiendo el acceso en caso contrario. Finalmente, extrae y procesa los datos
enviados en el cuerpo de la solicitud (como títulos, precios, coordenadas geográficas y datos
específicos de la parcela) para registrar un nuevo registro en la tabla de propiedades,
devolviendo el objeto creado o un error según el resultado de la operación.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const user = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
      include: { realEstate: true } 
    });

    if (!user || !user.realEstate) {
      return NextResponse.json(
        { error: "Solo las inmobiliarias pueden crear parcelas" },
        { status: 403 }
      );
    }

    const operationType =
      body.operationType === "rent" || body.operationType === "RENT"
        ? "RENT"
        : body.operationType === "sale" || body.operationType === "SALE"
        ? "SALE"
        : body.operationType === "both" || body.operationType === "SALE_RENT"
        ? "SALE_RENT"
        : "RENT";

    const newProperty = await prisma.property.create({
      data: {
        realEstateId: user.realEstate.user_id,

        title: body.title,
        description: body.description,

        address: body.street || body.address || "Sin dirección", 
        city: body.city,
        province: body.province,
        country: body.country ?? "Argentina",

        type: body.type,
        status: body.status ?? "AVAILABLE",
        operationType,

        salePrice: body.salePrice ? Number(body.salePrice) : null,
        rentPrice: body.rentPrice ? Number(body.rentPrice) : null,
        saleCurrency: body.saleCurrency || "USD",
        rentCurrency: body.rentCurrency || "ARS",

        area: body.areaM2 ? Number(body.areaM2) : (body.area ? Number(body.area) : null),
        rooms: body.rooms ? Number(body.rooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,

        hasWater: !!body.hasWater,
        hasElectricity: !!body.hasElectricity,
        hasGas: !!body.hasGas,
        hasInternet: !!body.hasInternet,
        hasParking: !!body.hasParking,
        hasPool: !!body.hasPool,

        images: body.images ?? [],

        latitude: body.latitude ? Number(body.latitude) : null,
        longitude: body.longitude ? Number(body.longitude) : null,
        parcelCCA: body.parcelCCA,
        parcelPDA: body.parcelPDA,
        parcelGeom: body.parcelGeom,
      },
    });

    return NextResponse.json(newProperty);
  } catch (error) {
    console.error("ERROR_CREATING_PROPERTY:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}