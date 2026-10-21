import type { Metadata } from "next";
import { getAllHelpPosts } from "@/lib/getHelpData";
import HelpSearch from "./HelpSearch";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Centro de ayuda",
  description:
    "Encontrá respuestas sobre cómo publicar propiedades, gestionar tu cuenta y usar las herramientas de Geora para martilleros, corredores e inmobiliarias.",
  path: "/help",
});

export default function HelpPage() {
  const posts = getAllHelpPosts();
  return (
    <main>
      <HelpSearch initialPosts={posts} />
    </main>
  );
}
