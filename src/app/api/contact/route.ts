import { NextResponse } from "next/server";
import { sendContactMessageEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const subject = String(body.subject || "").trim() || "Consulta General";
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Completá nombre, email y mensaje." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    await sendContactMessageEmail({ name, email, subject, message });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Error interno al enviar el mensaje." },
      { status: 500 },
    );
  }
}
