import prisma from "@/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse, NextRequest } from "next/server";

interface InquiryRequestBody {
  propertyId: number;
  message: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: InquiryRequestBody = await req.json();
    const { propertyId, message, senderName, senderEmail, senderPhone } = body;

    if (!propertyId || !message?.trim() || !senderName?.trim() || !senderEmail?.trim() || !senderPhone?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, realEstateId: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Propiedad no encontrada." },
        { status: 404 },
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: property.id,
        message: message.trim(),
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone.trim(),
        status: "UNREAD",
        ...(userId ? { userId } : {}),
      },
    });

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 });
  } catch (err) {
    const error = err as Error;
    console.error("Error al crear consulta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const user = await prisma.allUsers.findUnique({
      where: { email: session.user.email },
      select: { user_id: true, role: true },
    });

    if (!user || (user.role !== "REALESTATE" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          realEstateId: user.user_id,
        },
      },
      select: {
        id: true,
        message: true,
        senderName: true,
        senderEmail: true,
        senderPhone: true,
        status: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inquiries);
  } catch (err) {
    const error = err as Error;
    console.error("Error al obtener consultas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 },
    );
  }
}
