/*
Este archivo actúa como un servicio de gestión de usuarios que centraliza la
lógica para obtener, actualizar y pausar perfiles tanto desde el cliente (vía API)
como directamente en el servidor (usando Prisma). El código permite manejar de
forma diferenciada a usuarios comunes e inmobiliarias, gestionando transacciones
en la base de datos para asegurar la integridad de la información, el filtrado de
datos sensibles como contraseñas y la validación de credenciales mediante
encriptación para cambios de clave seguros.
*/


import { RealEstateFormFields, UserFormFields } from "../../../libs/types";
import prisma from "@/libs/db";
import bcrypt from "bcryptjs";
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
  _userRole: "USER" | "REALESTATE"
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
  console.log("2. Service -> Enviando PATCH con body:", JSON.stringify({ isActive }));
  
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
      realEstate: { include: { properties: true } },
    },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const { password: _password, ...userSafe } = user;

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
  name?: string;
  address?: string;
  website?: string;
  instagram?: string;
  bio?: string;    
  province?: string; 
  city?: string;    
};

export async function updateServerProfile(
  email: string,
  body: UpdateServerProfileBody
) {
  const authUser = await prisma.allUsers.findUnique({ 
    where: { email } 
  });

  if (!authUser) throw new Error("Usuario no encontrado");

  return await prisma.$transaction(async (tx) => {
    
    if (authUser.role === "USER") {
      const { firstName, lastName, phone } = body;
      if (!firstName || !lastName) throw new Error("Nombre y apellido requeridos");

      return await tx.user.update({
        where: { user_id: authUser.user_id },
        data: { firstName, lastName },
      });
    }

if (authUser.role === "REALESTATE") {
    const { name, address, website, phone, instagram, bio, province, city } = body;
    if (!name) throw new Error("El nombre de la inmobiliaria es requerido");

    return await tx.realEstate.update({
      where: { user_id: authUser.user_id },
      data: { 
        agencyName: name,
        address, 
        phone,
        website,
        instagram,
        bio,      
        province, 
        city      
      },
    });
  }

    throw new Error("Rol no soportado");
  });
}

export async function updateServerPassword(
  email: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.allUsers.findUnique({
    where: { email },
  });

  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error("La contraseña actual es incorrecta");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return await prisma.allUsers.update({
    where: { email },
    data: { password: hashedPassword },
  });
}