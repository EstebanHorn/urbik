/*
Este archivo define el Layout Raíz (Root Layout) de una aplicación Next.js, actuando como
la estructura base que envuelve a todas las páginas del sitio. Su función principal es 
configurar los elementos globales esenciales: establece el idioma en español, aplica la
fuente tipográfica Inter mediante variables de CSS, define los metadatos de SEO (título
y descripción) y organiza la jerarquía visual incluyendo de forma persistente un Navbar y
un Footer alrededor del contenido dinámico (children). Además, integra un componente de
Providers para gestionar estados o contextos globales y vincula la hoja de estilos general
para asegurar que el diseño sea consistente en toda la plataforma.
*/

import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Footer&Navbar/Navbar";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer&Navbar/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Urbik - Encotrá tu lugar",
  description: "Buscador de propiedades con estética sobria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}