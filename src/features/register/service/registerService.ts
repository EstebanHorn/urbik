/*
Esta función gestiona el registro de nuevos usuarios mediante una transacción de base de
datos para asegurar la integridad de la información: primero verifica que el correo no
exista, encripta la contraseña con bcryptjs y crea un registro central en la tabla de
usuarios generales; dependiendo del rol seleccionado (USER o REALESTATE), inserta
automáticamente los detalles adicionales en la tabla de clientes particulares o en la de
inmobiliarias, garantizando que ambos registros se completen con éxito o no se realice
ningún cambio.
*/

import { hash } from "bcryptjs";
import prisma from "@/libs/db";
import { Role } from "@prisma/client";

export type RegisterInput = {
  email: string;
  password: string;
  role: "USER" | "REALESTATE";
  firstName?: string;
  lastName?: string;
  agencyName?: string;
  license?: string;
  phone?: string;
  province?: string;
  city?: string;
  street?: string;
  address?: string;
};

export async function registerUserAndAgency(input: RegisterInput) {
  const { email, password, role } = input;

  const existingUser = await prisma.allUsers.findUnique({ where: { email } });
  if (existingUser) throw new Error("El correo ya está registrado");

  const hashedPassword = await hash(password, 10);

  return await prisma.$transaction(async (tx) => {
    const mainUser = await tx.allUsers.create({
      data: {
        email,
        password: hashedPassword,
        role: role as Role,
        status: role === "REALESTATE" ? "PENDING" : "APPROVED",
      },
    });

    if (role === "USER") {
      await tx.user.create({
        data: {
          user_id: mainUser.user_id,
          firstName: input.firstName || email.split("@")[0],
          lastName: input.lastName || "",
        },
      });
    } else if (role === "REALESTATE") {
      await tx.realEstate.create({
        data: {
          user_id: mainUser.user_id,
          agencyName: input.agencyName || "Nueva Inmobiliaria",
          license: input.license || `MAT-${mainUser.user_id}`,
          phone: input.phone,
          province: input.province || "",
          city: input.city || "",
          street: input.street || "",
          address: input.address || "",
        },
      });
    }

    return mainUser;
  });
}