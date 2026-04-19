import prisma from "@/libs/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse, NextRequest } from "next/server";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id: rawId } = await params;
    const inquiryId = parseInt(rawId);

    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        property: { select: { realEstateId: true } },
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { error: "Consulta no encontrada." },
        { status: 404 },
      );
    }

    if (
      user.role !== "ADMIN" &&
      inquiry.property.realEstateId !== user.user_id
    ) {
      return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
    }

    const updated = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: "READ" },
    });

    return NextResponse.json({ success: true, id: updated.id });
  } catch (err) {
    const error = err as Error;
    console.error("Error al actualizar consulta:", error);
    return NextResponse.json(
      { error: "Error interno del servidor.", detail: error.message },
      { status: 500 },
    );
  }
}
