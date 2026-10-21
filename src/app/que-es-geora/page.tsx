import type { Metadata } from "next";
import QueEsGeoraContent from "./QueEsGeoraContent";
import { faqs } from "./faqs";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "¿Qué es Geora? La plataforma inmobiliaria argentina con mapa parcelario",
  description:
    "Geora reúne búsqueda de propiedades, mapa parcelario, publicación para martilleros y corredores matriculados, agenda de clientes y Bolsa de Conexiones en un mismo lugar.",
  path: "/que-es-geora",
});

export default function QueEsGeoraPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(faqs.map(({ q, a }) => ({ q, a })))} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "¿Qué es Geora?", path: "/que-es-geora" },
        ])}
      />
      <QueEsGeoraContent />
    </>
  );
}
