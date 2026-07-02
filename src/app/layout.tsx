import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/home/layout/Navbar";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import Footer from "@/components/home/layout/Footer";
import SidebarFilters from "@/components/ui/PhoneFilters";
import MapListToggle from "@/components/search/MapListToggle";
import GoogleMapProvider from "@/components/google-map/GoogleMapProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Geora - Encotrá tu lugar",
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
        <GoogleMapProvider>
          <Providers>
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <Suspense fallback={null}>
              <SidebarFilters />
            </Suspense>
            <Suspense fallback={null}>
              <MapListToggle />
            </Suspense>
            {children}
            <Footer/>
          </Providers>
        </GoogleMapProvider>
      </body>
    </html>
  );
}