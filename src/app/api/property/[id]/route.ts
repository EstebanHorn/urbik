import { NextResponse } from "next/server";
import prisma from "@/libs/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OperationType, Prisma, PropertyStatus, PropertyType } from "@prisma/client";

const VALID_TYPES = new Set(Object.values(PropertyType));
const VALID_OPERATIONS = new Set(Object.values(OperationType));
const VALID_STATUSES = new Set(Object.values(PropertyStatus));

const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await req.json();

    const userAccount = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
    });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property || !userAccount) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const isOwner = property.realEstateId === userAccount.user_id;
    const isAdmin = userAccount.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const updateData: Prisma.PropertyUpdateInput = {
      title: body.title,
      description: body.description,
      type: body.type && VALID_TYPES.has(body.type as PropertyType) ? (body.type as PropertyType) : undefined,
      unitType: body.unitType ?? undefined,
      status:
        body.status && VALID_STATUSES.has(body.status as PropertyStatus)
          ? (body.status as PropertyStatus)
          : undefined,
      operationType:
        body.operationType && VALID_OPERATIONS.has(body.operationType as OperationType)
          ? (body.operationType as OperationType)
          : undefined,
      country: body.country ?? undefined,
      province: body.province ?? undefined,
      city: body.city ?? undefined,
      district: body.district ?? undefined,
      locality: body.locality ?? undefined,
      neighborhood: body.neighborhood ?? undefined,
      streetName: body.streetName ?? body.street ?? undefined,
      streetNumber: body.streetNumber ?? body.number ?? undefined,
      floor: body.floor ?? undefined,
      unitNumber: body.unitNumber ?? undefined,
      address: body.address ?? undefined,
      area: toNumberOrUndefined(body.area ?? body.areaM2),
      rooms: toNumberOrUndefined(body.rooms),
      bathrooms: toNumberOrUndefined(body.bathrooms),
      toilets: toNumberOrUndefined(body.toilets),
      garages: toNumberOrUndefined(body.garages),
      plants: toNumberOrUndefined(body.plants),
      coveredArea: toNumberOrUndefined(body.coveredArea),
      semiCoveredArea: toNumberOrUndefined(body.semiCoveredArea),
      uncoveredArea: toNumberOrUndefined(body.uncoveredArea),
      frontLength: toNumberOrUndefined(body.frontLength),
      backLength: toNumberOrUndefined(body.backLength),
      expenses: toNumberOrUndefined(body.expenses),
      images: body.images,
      propertySubtype: body.propertySubtype || undefined,
      youtubeUrl: body.youtubeUrl || undefined,
      tour360Url: body.tour360Url || undefined,
      isPriceHidden: body.isPriceHidden !== undefined ? Boolean(body.isPriceHidden) : undefined,
      featureGroups: body.featureGroups || undefined,
      extraData: body.extraData || undefined,
      hasWater:
        typeof body.amenities?.agua === "boolean"
          ? body.amenities.agua
          : undefined,
      hasElectricity:
        typeof body.amenities?.luz === "boolean"
          ? body.amenities.luz
          : undefined,
      hasGas:
        typeof body.amenities?.gas === "boolean"
          ? body.amenities.gas
          : undefined,
      hasInternet:
        typeof body.amenities?.internet === "boolean"
          ? body.amenities.internet
          : undefined,
      hasParking:
        typeof body.amenities?.cochera === "boolean"
          ? body.amenities.cochera
          : undefined,
      hasPool:
        typeof body.amenities?.pileta === "boolean"
          ? body.amenities.pileta
          : undefined,
      salePrice:
        body.salePrice !== undefined
          ? body.salePrice === "" || body.salePrice === null
            ? null
            : Number(body.salePrice)
          : undefined,
      rentPrice:
        body.rentPrice !== undefined
          ? body.rentPrice === "" || body.rentPrice === null
            ? null
            : Number(body.rentPrice)
          : undefined,
      saleCurrency: body.saleCurrency ?? undefined,
      rentCurrency: body.rentCurrency ?? undefined,
    };

    const safeUpdateData = updateData as Record<string, unknown>;
    Object.keys(safeUpdateData).forEach((key) => {
      if (safeUpdateData[key] === undefined) {
        delete safeUpdateData[key];
      }
    });

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ERROR EN PUT PROPERTY:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error interno", message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    const userAccount = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
    });

    const property = await prisma.property.findUnique({ where: { id } });

    if (!property || !userAccount) {
      return NextResponse.json({ error: "No encontrada" }, { status: 404 });
    }

    const isOwner = property.realEstateId === userAccount.user_id;
    const isAdmin = userAccount.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: "Propiedad eliminada correctamente" });
  } catch (error) {
    console.error("Error en DELETE property:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
