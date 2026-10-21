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
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  JsonLd,
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  absoluteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "propiedades Argentina",
    "portal inmobiliario",
    "mapa parcelario",
    "comprar propiedad",
    "alquilar propiedad",
    "inmobiliarias La Plata",
    "terrenos y campos",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    type: "website",
    images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE) }],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable}`}>
      <body className="overflow-x-hidden">
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
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
            <Footer />
          </Providers>
        </GoogleMapProvider>
      </body>
    </html>
  );
}
