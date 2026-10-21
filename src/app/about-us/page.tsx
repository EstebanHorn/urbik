import type { Metadata } from "next";
import AboutUsContent from "./AboutUsContent";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Sobre Nosotros",
  description:
    "Conocé la misión de Geora: transformar la experiencia inmobiliaria en Argentina con transparencia, tecnología y herramientas pensadas para profesionales del sector.",
  path: "/about-us",
});

export default function AboutUsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Sobre Nosotros", path: "/about-us" },
        ])}
      />
      <AboutUsContent />
    </>
  );
}
