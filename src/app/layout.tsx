import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import Footer from "@/components/layout/Footer";
import SidebarFilters from "@/components/ui/SidebarFilters";

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
      <body className="overflow-x-hidden">
        <Providers>
          <Navbar />
          <SidebarFilters />
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}