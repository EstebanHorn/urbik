import type { Metadata } from "next";
import TermsContent from "./TermsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de la plataforma Geora.",
  path: "/terms",
});

export default function Page() {
  return <TermsContent />;
}
