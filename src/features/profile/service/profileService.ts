/*
Servicio de perfil: lectura/actualizacion de usuario e inmobiliaria,
incluyendo matrices legales (matriculas) y oficinas.
*/

import { RealEstateFormFields, UserFormFields } from "../../../libs/types";
import prisma from "@/libs/db";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "@/libs/slugify";

export async function fetchProfileData() {
  const res = await fetch("/api/user");

  if (!res.ok) {
    const errorData: { error?: string } = await res.json();
    throw new Error(errorData.error || "Error al cargar datos del usuario");
  }

  return res.json();
}

export async function updateProfile(
  payload: RealEstateFormFields | UserFormFields,
  _userRole: "USER" | "REALESTATE",
) {
  const res = await fetch("/api/user", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data: { error?: string } = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Error al actualizar perfil");
  }

  return data;
}

export async function toggleAccountPause(isActive: boolean) {
  const res = await fetch("/api/user", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  const data = await res.json();
  return data;
}

export async function getServerUserProfile(email: string) {
  const user = await prisma.allUsers.findUnique({
    where: { email },
    include: {
      realEstate: {
        include: {
          properties: true,
          licenses: {
            orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          },
          offices: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
      userData: true,
    },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const { password, ...userSafe } = user;

  return {
    ...userSafe,
    isActive: user.isActive,
    agencyData: user.role === "REALESTATE" ? user.realEstate : null,
    personalData: user.role === "USER" ? user.userData : null,
  };
}

type UpdateServerProfileBody = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  agencyName?: string;
  name?: string;
  address?: string;
  website?: string;
  instagram?: string;
  bio?: string;
  province?: string;
  city?: string;
  licenses?: Array<{
    id?: number;
    licenseNumber: string;
    province: string;
    jurisdiction?: string | null;
    responsibleName: string;
    isPrimary?: boolean;
  }>;
  offices?: Array<{
    id?: number;
    name: string;
    province: string;
    city: string;
    street: string;
    number: string;
    phone?: string | null;
  }>;
};

export async function updateServerProfile(
  email: string,
  body: UpdateServerProfileBody,
) {
  const authUser = await prisma.allUsers.findUnique({
    where: { email },
  });

  if (!authUser) throw new Error("Usuario no encontrado");

  return await prisma.$transaction(async (tx) => {
    if (authUser.role === "USER") {
      const { firstName, lastName } = body;
      if (!firstName || !lastName) {
        throw new Error("Nombre y apellido requeridos");
      }

      await tx.user.update({
        where: { user_id: authUser.user_id },
        data: { firstName, lastName },
      });

      return { ok: true };
    }

    if (authUser.role === "REALESTATE") {
      const {
        agencyName,
        name,
        address,
        website,
        phone,
        instagram,
        bio,
        province,
        city,
        licenses,
        offices,
      } = body;
      const finalName = agencyName || name;

      if (!finalName) {
        throw new Error("El nombre de la inmobiliaria es requerido");
      }

      // Check if slug needs to be generated (outside transaction to avoid deadlock)
      const existingRealEstate = await prisma.realEstate.findUnique({
        where: { user_id: authUser.user_id },
        select: { slug: true },
      });

      const slugData: { slug?: string } = {};
      if (!existingRealEstate?.slug) {
        slugData.slug = await generateUniqueSlug(finalName, authUser.user_id);
      }

      const updatedRealEstate = await tx.realEstate.update({
        where: { user_id: authUser.user_id },
        data: {
          agencyName: finalName,
          address,
          phone,
          website,
          instagram,
          bio,
          province,
          city,
          ...slugData,
        },
      });

      const validLicenses =
        licenses?.filter(
          (item) =>
            item.licenseNumber?.trim() &&
            item.province?.trim() &&
            item.responsibleName?.trim(),
        ) ?? [];

      if (validLicenses.length > 0) {
        await tx.realEstateLicense.deleteMany({
          where: { realEstateId: authUser.user_id },
        });

        await tx.realEstateLicense.createMany({
          data: validLicenses.map((item, index) => ({
            realEstateId: authUser.user_id,
            licenseNumber: item.licenseNumber.trim(),
            province: item.province.trim(),
            jurisdiction: item.jurisdiction?.trim() || null,
            responsibleName: item.responsibleName.trim(),
            isPrimary:
              typeof item.isPrimary === "boolean" ? item.isPrimary : index === 0,
          })),
        });

        const firstPrimary =
          validLicenses.find((item) => item.isPrimary) ?? validLicenses[0];
        if (firstPrimary) {
          await tx.realEstate.update({
            where: { user_id: authUser.user_id },
            data: { license: firstPrimary.licenseNumber.trim() },
          });
        }
      }

      const validOffices =
        offices?.filter(
          (item) =>
            item.name?.trim() &&
            item.province?.trim() &&
            item.city?.trim() &&
            item.street?.trim() &&
            item.number?.trim(),
        ) ?? [];

      if (validOffices.length > 0) {
        await tx.realEstateOffice.deleteMany({
          where: { realEstateId: authUser.user_id },
        });

        await tx.realEstateOffice.createMany({
          data: validOffices.map((item) => ({
            realEstateId: authUser.user_id,
            name: item.name.trim(),
            province: item.province.trim(),
            city: item.city.trim(),
            street: item.street.trim(),
            number: item.number.trim(),
            phone: item.phone?.trim() || null,
          })),
        });
      }

      return updatedRealEstate;
    }

    throw new Error("Rol no soportado");
  });
}

export async function updateServerPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.allUsers.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("La contrasena actual es incorrecta");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return await prisma.allUsers.update({
    where: { email },
    data: { password: hashedPassword },
  });
}

