/*
ARCHIVO: src/app/api/properties/in-bounds/route.ts
CORRECCIÓN: Eliminada la selección de 'price' que no existe en la BD y uso de Prisma.PropertyWhereInput.
*/

import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { Currency, OperationType, PropertyType, Prisma } from "@prisma/client";


const buildNumericSelectionFilter = (values: string[]): Prisma.IntNullableFilter | undefined => {
  if (values.length === 0) return undefined;

  const exactValues = values
    .filter((value) => !value.endsWith("+"))
    .map((value) => parseInt(value, 10))
    .filter((value) => !isNaN(value));

  const plusValues = values
    .filter((value) => value.endsWith("+"))
    .map((value) => parseInt(value.replace("+", ""), 10))
    .filter((value) => !isNaN(value));

  if (exactValues.length === 0 && plusValues.length === 0) return undefined;

  const minPlusValue = plusValues.length > 0 ? Math.min(...plusValues) : undefined;

  if (exactValues.length > 0 && minPlusValue !== undefined) {
    return {
      in: [...new Set(exactValues)],
      gte: minPlusValue,
    };
  }

  if (minPlusValue !== undefined) {
    return { gte: minPlusValue };
  }

  return { in: [...new Set(exactValues)] };
};

const LEGACY_MISSING_AMENITIES = [
  "hasBalcony",
  "hasGrill",
  "hasGarden",
  "hasLaundry",
  "hasAirConditioning",
] as const;

const PROPERTY_SELECT_FULL = {
  id: true,
  title: true,
  salePrice: true,
  saleCurrency: true,
  rentPrice: true,
  rentCurrency: true,
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
  hasBalcony: true,
  hasGrill: true,
  hasGarden: true,
  hasLaundry: true,
  hasAirConditioning: true,
} satisfies Prisma.PropertySelect;

const PROPERTY_SELECT_LEGACY = {
  id: true,
  title: true,
  salePrice: true,
  saleCurrency: true,
  rentPrice: true,
  rentCurrency: true,
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
} satisfies Prisma.PropertySelect;

function stripLegacyMissingAmenityFilters(
  whereClause: Prisma.PropertyWhereInput,
): Prisma.PropertyWhereInput {
  const withoutLegacyFields = {
    ...whereClause,
  } as Prisma.PropertyWhereInput & Record<string, unknown>;

  for (const field of LEGACY_MISSING_AMENITIES) {
    delete withoutLegacyFields[field];
  }

  return withoutLegacyFields;
}

function isMissingColumnError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022"
  );
}

function isPrismaServiceUnavailableError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P5010" || error.code === "P1001" || error.code === "P1002")
  );
}

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
  const currency = searchParams.get("currency");
  const bedrooms = searchParams.getAll("bedrooms");
  const bathrooms = searchParams.getAll("bathrooms");
  const minArea = searchParams.get("minArea");
  const maxArea = searchParams.get("maxArea");
  const age = searchParams.get("age");
  const city = searchParams.get("city");
  const province = searchParams.get("province");
  const text = searchParams.get("q");

  const hasWater = searchParams.get("hasWater") === "true";
  const hasElectricity = searchParams.get("hasElectricity") === "true";
  const hasGas = searchParams.get("hasGas") === "true";
  const hasInternet = searchParams.get("hasInternet") === "true";
  const hasParking = searchParams.get("hasParking") === "true";
  const hasPool = searchParams.get("hasPool") === "true";
  const hasBalcony = searchParams.get("hasBalcony") === "true";
  const hasGrill = searchParams.get("hasGrill") === "true";
  const hasGarden = searchParams.get("hasGarden") === "true";
  const hasLaundry = searchParams.get("hasLaundry") === "true";
  const hasAirConditioning =
    searchParams.get("hasAirConditioning") === "true";

  if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLon) || isNaN(maxLon)) {
    return NextResponse.json(
      { error: "Coordenadas inválidas" },
      { status: 400 },
    );
  }

  try {
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

    if (city) {
      whereClause.city = { contains: city, mode: "insensitive" };
    }

    if (province) {
      whereClause.province = { contains: province, mode: "insensitive" };
    }

    if (text) {
      const currentAnd = whereClause.AND
        ? Array.isArray(whereClause.AND)
          ? whereClause.AND
          : [whereClause.AND]
        : [];
      whereClause.AND = [
        ...currentAnd,
        {
          OR: [
            { title: { contains: text, mode: "insensitive" } },
            { address: { contains: text, mode: "insensitive" } },
            { city: { contains: text, mode: "insensitive" } },
            { province: { contains: text, mode: "insensitive" } },
          ],
        },
      ];
    }

    const roomsFilter = buildNumericSelectionFilter(bedrooms);
    if (roomsFilter) {
      whereClause.rooms = roomsFilter;
    }

    const bathroomsFilter = buildNumericSelectionFilter(bathrooms);
    if (bathroomsFilter) {
      whereClause.bathrooms = bathroomsFilter;
    }

    if (minArea || maxArea) {
      whereClause.area = {
        ...(minArea && { gte: parseFloat(minArea) }),
        ...(maxArea && { lte: parseFloat(maxArea) }),
      };
    }

    if (age) {
      const ageInYears = parseInt(age, 10);
      if (!isNaN(ageInYears)) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - ageInYears);
        whereClause.createdAt = {
          gte: minDate,
        };
      }
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

      if (currency) {
        whereClause.OR = [
          {
            salePrice: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
            saleCurrency: currency as Currency,
          },
          {
            rentPrice: {
              ...(minPrice && { gte: parseFloat(minPrice) }),
              ...(maxPrice && { lte: parseFloat(maxPrice) }),
            },
            rentCurrency: currency as Currency,
          },
        ];
      }
    } else if (currency) {
      whereClause.OR = [
        { saleCurrency: currency as Currency },
        { rentCurrency: currency as Currency },
      ];
    }

    if (hasWater) whereClause.hasWater = true;
    if (hasElectricity) whereClause.hasElectricity = true;
    if (hasGas) whereClause.hasGas = true;
    if (hasInternet) whereClause.hasInternet = true;
    if (hasParking) whereClause.hasParking = true;
    if (hasPool) whereClause.hasPool = true;
    if (hasBalcony) whereClause.hasBalcony = true;
    if (hasGrill) whereClause.hasGrill = true;
    if (hasGarden) whereClause.hasGarden = true;
    if (hasLaundry) whereClause.hasLaundry = true;
    if (hasAirConditioning) whereClause.hasAirConditioning = true;

    let properties;
    try {
      properties = await prisma.property.findMany({
        where: whereClause,
        select: PROPERTY_SELECT_FULL,
      });
    } catch (queryError) {
      if (!isMissingColumnError(queryError)) {
        throw queryError;
      }

      const fallbackWhere = stripLegacyMissingAmenityFilters(whereClause);
      const legacyProperties = await prisma.property.findMany({
        where: fallbackWhere,
        select: PROPERTY_SELECT_LEGACY,
      });

      properties = legacyProperties.map((property) => ({
        ...property,
        hasBalcony: false,
        hasGrill: false,
        hasGarden: false,
        hasLaundry: false,
        hasAirConditioning: false,
      }));
    }

    return NextResponse.json({ properties });
  } catch (error) {
    if (isPrismaServiceUnavailableError(error)) {
      console.warn("Prisma service unavailable in in-bounds route:", error.code);
      return NextResponse.json({ properties: [] });
    }

    console.error("Error fetching properties in bounds:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
