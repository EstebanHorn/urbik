import type { Metadata } from "next";
import ConditionsContent from "./ConditionsContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Condiciones de Contratación",
  description: "Condiciones de contratación de los servicios de la plataforma Geora.",
  path: "/conditions",
});

export default function Page() {
  return <ConditionsContent />;
}
