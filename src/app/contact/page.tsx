import type { Metadata } from "next";
import ContactContent from "./ContactContent";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contacto",
  description:
    "Comunicate con el equipo de Geora para consultas, soporte o alianzas comerciales con la plataforma inmobiliaria argentina.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Inicio", path: "/" },
          { name: "Contacto", path: "/contact" },
        ])}
      />
      <ContactContent />
    </>
  );
}
