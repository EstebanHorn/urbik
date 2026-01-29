-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'AGENTE');

-- CreateEnum
CREATE TYPE "public"."TipoPropiedad" AS ENUM ('CASA', 'DEPARTAMENTO', 'TERRENO', 'LOCAL', 'OFICINA');

-- CreateEnum
CREATE TYPE "public"."TipoOperacion" AS ENUM ('ALQUILER', 'VENTA');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."Inmobiliaria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "sitioWeb" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inmobiliaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Propiedad" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "tipo" "public"."TipoPropiedad" NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "superficie" DOUBLE PRECISION,
    "habitaciones" INTEGER,
    "banos" INTEGER,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "inmobiliariaId" INTEGER,
    "imagenes" TEXT[],
    "tipoOperacion" "public"."TipoOperacion" NOT NULL DEFAULT 'ALQUILER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Consulta" (
    "id" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorito" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propiedadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alerta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipoOperacion" "public"."TipoOperacion",
    "tipoPropiedad" "public"."TipoPropiedad",
    "ciudad" TEXT,
    "precioMin" DOUBLE PRECISION,
    "precioMax" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_userId_propiedadId_key" ON "public"."Favorito"("userId", "propiedadId");

-- AddForeignKey
ALTER TABLE "public"."Inmobiliaria" ADD CONSTRAINT "Inmobiliaria_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Propiedad" ADD CONSTRAINT "Propiedad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Propiedad" ADD CONSTRAINT "Propiedad_inmobiliariaId_fkey" FOREIGN KEY ("inmobiliariaId") REFERENCES "public"."Inmobiliaria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consulta" ADD CONSTRAINT "Consulta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consulta" ADD CONSTRAINT "Consulta_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "public"."Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorito" ADD CONSTRAINT "Favorito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorito" ADD CONSTRAINT "Favorito_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "public"."Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alerta" ADD CONSTRAINT "Alerta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
