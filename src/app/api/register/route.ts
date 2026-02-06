/*
Este código define un manejador de ruta (Route Handler) en Next.js para peticiones de tipo
POST que gestiona el registro simultáneo de un usuario y una agencia. El proceso comienza
extrayendo los datos del cuerpo de la solicitud en formato JSON para luego invocar a la
función de servicio registerUserAndAgency, la cual se encarga de la lógica de persistencia;
si la operación es exitosa, el servidor responde con un estado 201 (Created) y los datos del
usuario creado, mientras que, en caso de fallo, captura la excepción, la registra en consola
y devuelve un error 400 con un mensaje descriptivo.
*/

import { NextResponse, NextRequest } from "next/server";
import { registerUserAndAgency } from "@/features/register/service/registerService";

const ALLOWED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "protonmail.com",
  "live.com",
  "msn.com",
  "me.com",
  "aol.com",
];

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const email = data.email?.toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const domain = email.split("@")[1];

    if (!ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        {
          error:
            "El dominio de correo no está permitido. Usa un servicio conocido.",
        },
        { status: 400 },
      );
    }

    const user = await registerUserAndAgency({
      email: email,
      password: data.password,
      role: data.role,
      firstName: data.name,
      lastName: data.lastName,
      agencyName: data.name,
      license: data.license,
      phone: data.phone,
      province: data.province,
      city: data.city,
      street: data.street,
      address: data.address,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    const message = error instanceof Error ? error.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
