import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const HOME_TITLE =
  "Geora - Encontrá tu lugar | Portal inmobiliario con mapa parcelario";

export const metadata: Metadata = {
  ...buildMetadata({
    title: HOME_TITLE,
    description:
      "Buscá y publicá propiedades en Argentina: casas, departamentos, terrenos y campos para comprar o alquilar. Explorá el mapa parcelario de Geora y conectá con inmobiliarias matriculadas.",
    path: "/",
  }),
  // Bypasses the root layout's "%s | Geora" template so the brand name
  // isn't appended twice on the homepage, which already includes it.
  title: { absolute: HOME_TITLE },
};

export default function Page() {
  return <HomeClient />;
}
