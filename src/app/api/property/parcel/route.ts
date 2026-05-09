import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  OperationType,
  PropertyStatus,
  PropertyType,
} from "@prisma/client";

const VALID_TYPES = new Set(Object.values(PropertyType));
const VALID_OPERATIONS = new Set(Object.values(OperationType));
const VALID_STATUSES = new Set(Object.values(PropertyStatus));

const toNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const user = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
      include: { realEstate: true },
    });

    if (!user || !user.realEstate) {
      return NextResponse.json(
        { error: "Solo las inmobiliarias pueden crear propiedades" },
        { status: 403 },
      );
    }

    const normalizedOperation =
      body.operationType === "rent" || body.operationType === "RENT"
        ? "RENT"
        : body.operationType === "temp_rent" || body.operationType === "TEMP_RENT"
          ? "TEMP_RENT"
          : body.operationType === "sale" || body.operationType === "SALE"
            ? "SALE"
            : body.operationType === "both" || body.operationType === "SALE_RENT"
              ? "SALE_RENT"
              : "RENT";

    const normalizedStatus = (body.status || "AVAILABLE") as PropertyStatus;

    const title = String(body.title || "").trim();
    const type = String(body.type || "").trim();
    const city = String(body.city || "").trim();
    const province = String(body.province || "").trim();
    const streetName = String(body.streetName || body.street || "").trim();
    const streetNumber = String(body.streetNumber || body.number || "").trim();
    const address = String(body.address || `${streetName} ${streetNumber}`.trim() || "Sin dirección");

    if (!title || !type || !city || !province || !streetName) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios de publicación" },
        { status: 400 },
      );
    }

    if (!VALID_TYPES.has(type as PropertyType)) {
      return NextResponse.json({ error: "Tipo de propiedad inválido" }, { status: 400 });
    }

    if (!VALID_OPERATIONS.has(normalizedOperation as OperationType)) {
      return NextResponse.json({ error: "Operación inválida" }, { status: 400 });
    }

    if (!VALID_STATUSES.has(normalizedStatus)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const isPriceHidden = Boolean(body.isPriceHidden);
    const hasSale = body.salePrice !== null && body.salePrice !== undefined && body.salePrice !== "";
    const hasRent = body.rentPrice !== null && body.rentPrice !== undefined && body.rentPrice !== "";

    if (!isPriceHidden) {
      if (normalizedOperation === "SALE" && !hasSale) {
        return NextResponse.json({ error: "Falta precio de venta" }, { status: 400 });
      }
      if ((normalizedOperation === "RENT" || normalizedOperation === "TEMP_RENT") && !hasRent) {
        return NextResponse.json({ error: "Falta precio de alquiler" }, { status: 400 });
      }
      if (normalizedOperation === "SALE_RENT" && !hasSale && !hasRent) {
        return NextResponse.json(
          { error: "Completá al menos un precio o marcá Sin precio" },
          { status: 400 },
        );
      }
    }

    const newProperty = await prisma.property.create({
      data: {
        realEstateId: user.realEstate.user_id,
        title,
        description: body.description || "",
        address,
        city,
        province,
        country: body.country || "Argentina",
        district: body.district || null,
        locality: body.locality || null,
        neighborhood: body.neighborhood || null,
        streetName,
        streetNumber: streetNumber || null,
        floor: body.floor || null,
        unitNumber: body.unitNumber || null,
        type: type as PropertyType,
        unitType: body.unitType || null,
        propertySubtype: body.propertySubtype || null,
        status: normalizedStatus,
        operationType: normalizedOperation as OperationType,
        isPriceHidden,
        salePrice: toNumberOrNull(body.salePrice),
        rentPrice: toNumberOrNull(body.rentPrice),
        saleCurrency: body.saleCurrency || "USD",
        rentCurrency: body.rentCurrency || "ARS",
        area: toNumberOrNull(body.areaM2 ?? body.area),
        rooms: toNumberOrNull(body.rooms),
        bedrooms: toNumberOrNull(body.bedrooms),
        bathrooms: toNumberOrNull(body.bathrooms),
        toilets: toNumberOrNull(body.toilets),
        garages: toNumberOrNull(body.garages),
        plants: toNumberOrNull(body.plants),
        coveredArea: toNumberOrNull(body.coveredArea),
        semiCoveredArea: toNumberOrNull(body.semiCoveredArea),
        uncoveredArea: toNumberOrNull(body.uncoveredArea),
        frontLength: toNumberOrNull(body.frontLength),
        backLength: toNumberOrNull(body.backLength),
        expenses: toNumberOrNull(body.expenses),
        hasLaundry: body.laundryType ? true : false,
        hasWater: !!body.hasWater,
        hasElectricity: !!body.hasElectricity,
        hasGas: !!body.hasGas,
        hasInternet: !!body.hasInternet,
        hasParking: !!body.hasParking,
        hasPool: !!body.hasPool,
        featureGroups: body.featureGroups || {},
        extraData: { ...(body.extraData || {}), laundryType: body.laundryType || null },
        youtubeUrl: body.youtubeUrl || null,
        tour360Url: body.tour360Url || null,
        images: body.images ?? [],
        latitude: toNumberOrNull(body.latitude),
        longitude: toNumberOrNull(body.longitude),
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
