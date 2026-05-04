import { NextResponse, NextRequest } from "next/server";
import prisma from "@/libs/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await prisma.allUsers.findUnique({
      where: { email: normalized },
      select: { user_id: true },
    });

    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json(
      { error: "Error al verificar el correo" },
      { status: 500 },
    );
  }
}
