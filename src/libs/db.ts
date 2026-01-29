/*
Este archivo configura y exporta una instancia única de Prisma Client. 
Incluye una lógica de seguridad para entornos de desarrollo que evita que 
se creen múltiples conexiones a la base de datos durante el "Hot Reloading", 
previniendo errores de agotamiento de recursos.
*/

import { PrismaClient } from '@prisma/client';

type CustomNodeJsGlobal = typeof global & {
  prisma?: PrismaClient;
};

const globalForPrisma = global as CustomNodeJsGlobal;

const prisma: PrismaClient = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;