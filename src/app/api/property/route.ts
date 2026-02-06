/*
Este código implementa un endpoint de API en Next.js (utilizando App Router) para la creación de
propiedades inmobiliarias, gestionando de forma integral la autenticación y el control de acceso
mediante NextAuth y Prisma. El flujo comienza verificando la sesión del usuario y validando que
este posea el rol de "REALESTATE"; posteriormente, extrae la información del cuerpo de la solicitud
(POST), realiza una limpieza y conversión de tipos de datos (como el parseo de números y manejo de
valores nulos), y finalmente persiste la nueva propiedad en la base de datos vinculándola al usuario
autenticado, devolviendo la propiedad creada con un estado 201 o gestionando posibles errores de
validación y servidor.
*/

import prisma from "@/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse, NextRequest } from "next/server";
import { PropertyType, OperationType, Currency } from "@prisma/client";

interface PropertyRequestBody {
  title: string;
  description?: string;
  address: string;
  city: string;
  province?: string;
  country?: string;
  type: PropertyType;
  salePrice?: number | string;
  rentPrice?: number | string;

  // Estos campos faltaban:
  saleCurrency?: Currency;
  rentCurrency?: Currency;

  areaM2?: number | string;
  rooms?: number | string;
  bathrooms?: number | string;
  operationType: OperationType;
  images?: string[];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const email = session.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Email de sesión no encontrado" },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.allUsers.findUnique({
      where: { email },
      include: { realEstate: true },
    });

    if (!user || user.role !== "REALESTATE") {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const body: PropertyRequestBody = await req.json();

    const {
      title,
      description,
      address,
      city,
      province,
      country,
      type,
      salePrice,
      saleCurrency,
      rentPrice,
      rentCurrency,
      areaM2,
      rooms,
      bathrooms,
      operationType,
      images,
    } = body;

    if (!title || !city || !operationType) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 },
      );
    }

    const newProperty = await prisma.property.create({
      data: {
        title,
        description: description || "",
        address,
        city,
        province: province ?? "",
        country: country ?? "Argentina",
        type,
        operationType,
        status: "AVAILABLE",
        salePrice: salePrice ? parseFloat(salePrice.toString()) : null,
        saleCurrency: saleCurrency || "USD",
        rentPrice: rentPrice ? parseFloat(rentPrice.toString()) : null,
        rentCurrency: rentCurrency || "ARS",
        area: areaM2 ? parseFloat(areaM2.toString()) : null,
        rooms: rooms ? parseInt(rooms.toString()) : null,
        bathrooms: bathrooms ? parseInt(bathrooms.toString()) : null,
        images: images || [],
        realEstateId: user.user_id,
      },
    });

    return NextResponse.json(newProperty, { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error("Error al crear propiedad:", error);
    return NextResponse.json(
      { error: "Error al crear la propiedad", detail: error.message },
      { status: 500 },
    );
  }
}
