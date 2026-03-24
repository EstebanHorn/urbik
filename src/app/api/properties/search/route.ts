import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { Currency, OperationType, PropertyType, Prisma } from "@prisma/client";

const buildNumericSelectionFilter = (
  values: string[],
): Prisma.IntNullableFilter | undefined => {
  if (values.length === 0) return undefined;

  const exactValues = values
    .filter((value) => !value.endsWith("+"))
    .map((value) => parseInt(value, 10))
    .filter((value) => !Number.isNaN(value));

  const plusValues = values
    .filter((value) => value.endsWith("+"))
    .map((value) => parseInt(value.replace("+", ""), 10))
    .filter((value) => !Number.isNaN(value));

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

const PROPERTY_SELECT = {
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
  images: true,
  address: true,
  rooms: true,
  bathrooms: true,
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
  createdAt: true,
} as Prisma.PropertySelect;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

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

  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") || "24", 10) || 24),
  );

  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const radiusKm = Math.max(
    1,
    Number.parseFloat(searchParams.get("radius") || "30") || 30,
  );

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
  const hasAirConditioning = searchParams.get("hasAirConditioning") === "true";

  try {
    const whereClause: Prisma.PropertyWhereInput = {
      status: "AVAILABLE",
    };

    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      const latDelta = radiusKm / 111;
      const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
      whereClause.latitude = { gte: lat - latDelta, lte: lat + latDelta };
      whereClause.longitude = { gte: lon - lonDelta, lte: lon + lonDelta };
    }

    if (operationType) whereClause.operationType = operationType as OperationType;
    if (propertyType) whereClause.type = propertyType as PropertyType;
    if (city) whereClause.city = { contains: city, mode: "insensitive" };
    if (province) whereClause.province = { contains: province, mode: "insensitive" };

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
    if (roomsFilter) whereClause.rooms = roomsFilter;

    const bathroomsFilter = buildNumericSelectionFilter(bathrooms);
    if (bathroomsFilter) whereClause.bathrooms = bathroomsFilter;

    if (minArea || maxArea) {
      whereClause.area = {
        ...(minArea && { gte: parseFloat(minArea) }),
        ...(maxArea && { lte: parseFloat(maxArea) }),
      };
    }

    if (age) {
      const ageInYears = parseInt(age, 10);
      if (!Number.isNaN(ageInYears)) {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - ageInYears);
        whereClause.createdAt = { gte: minDate };
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

    const dynamicWhere = whereClause as Record<string, unknown>;
    if (hasWater) dynamicWhere.hasWater = true;
    if (hasElectricity) dynamicWhere.hasElectricity = true;
    if (hasGas) dynamicWhere.hasGas = true;
    if (hasInternet) dynamicWhere.hasInternet = true;
    if (hasParking) dynamicWhere.hasParking = true;
    if (hasPool) dynamicWhere.hasPool = true;
    if (hasBalcony) dynamicWhere.hasBalcony = true;
    if (hasGrill) dynamicWhere.hasGrill = true;
    if (hasGarden) dynamicWhere.hasGarden = true;
    if (hasLaundry) dynamicWhere.hasLaundry = true;
    if (hasAirConditioning) dynamicWhere.hasAirConditioning = true;

    const [total, items] = await Promise.all([
      prisma.property.count({ where: whereClause }),
      prisma.property.findMany({
        where: whereClause,
        select: PROPERTY_SELECT,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching properties search:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
