import type { Metadata } from "next";
import PropertiesClient from "./PropertiesClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Propiedades en venta y alquiler",
  description:
    "Mirá el catálogo completo de propiedades publicadas en Geora: casas, departamentos, terrenos y campos de inmobiliarias matriculadas en toda la Argentina.",
  path: "/properties",
});

export default function Page() {
  return <PropertiesClient />;
}
