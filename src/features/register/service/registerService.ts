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
  responsibleName?: string;
  jurisdiction?: string;
  phone?: string;
  province?: string;
  city?: string;
  street?: string;
  address?: string;
  licenses?: Array<{
    licenseNumber: string;
    province: string;
    jurisdiction?: string;
    responsibleName: string;
    isPrimary?: boolean;
  }>;
  offices?: Array<{
    name: string;
    province: string;
    city: string;
    street: string;
    number: string;
    phone?: string;
  }>;
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
      const realEstate = await tx.realEstate.create({
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

      const normalizedLicenses =
        input.licenses?.filter(
          (item) =>
            item.licenseNumber?.trim() &&
            item.province?.trim() &&
            item.responsibleName?.trim(),
        ) ?? [];

      if (normalizedLicenses.length > 0) {
        await tx.realEstateLicense.createMany({
          data: normalizedLicenses.map((license, index) => ({
            realEstateId: realEstate.user_id,
            licenseNumber: license.licenseNumber.trim(),
            province: license.province.trim(),
            jurisdiction: license.jurisdiction?.trim() || null,
            responsibleName: license.responsibleName.trim(),
            isPrimary:
              typeof license.isPrimary === "boolean"
                ? license.isPrimary
                : index === 0,
          })),
        });
      } else {
        await tx.realEstateLicense.create({
          data: {
            realEstateId: realEstate.user_id,
            licenseNumber: input.license || `MAT-${mainUser.user_id}`,
            province: input.province || "Buenos Aires",
            jurisdiction: input.jurisdiction || null,
            responsibleName: input.responsibleName || input.agencyName || "Responsable",
            isPrimary: true,
          },
        });
      }

      const normalizedOffices =
        input.offices?.filter(
          (office) =>
            office.name?.trim() &&
            office.province?.trim() &&
            office.city?.trim() &&
            office.street?.trim() &&
            office.number?.trim(),
        ) ?? [];

      const baseOffice =
        normalizedOffices.length > 0
          ? normalizedOffices
          : [
              {
                name: "Casa central",
                province: input.province || "",
                city: input.city || "",
                street: input.street || "",
                number: input.address || "S/N",
                phone: input.phone || "",
              },
            ];

      await tx.realEstateOffice.createMany({
        data: baseOffice.map((office) => ({
          realEstateId: realEstate.user_id,
          name: office.name.trim(),
          province: office.province.trim(),
          city: office.city.trim(),
          street: office.street.trim(),
          number: office.number.trim(),
          phone: office.phone?.trim() || null,
        })),
      });
    }

    return mainUser;
  });
}
