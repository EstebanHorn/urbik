import type { Metadata } from "next";
import MapClient from "./MapClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Mapa de propiedades | Explorá el territorio con parcelas",
  description:
    "Explorá propiedades en venta y alquiler sobre un mapa parcelario interactivo: casas, departamentos, terrenos y campos ubicados en su territorio real.",
  path: "/map",
});

export default function Page() {
  return <MapClient />;
}
