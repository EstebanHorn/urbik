import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de la plataforma Geora.",
  path: "/privacy",
});

export default function Page() {
  return <PrivacyContent />;
}
