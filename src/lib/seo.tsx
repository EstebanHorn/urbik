import type { Metadata } from "next";

export const SITE_URL = "https://geora.com.ar";
export const SITE_NAME = "Geora";
export const DEFAULT_TITLE = "Geora - Encontrá tu lugar";
export const DEFAULT_DESCRIPTION =
  "Geora es la plataforma inmobiliaria argentina con mapa parcelario: buscá y publicá casas, departamentos, terrenos y campos para comprar o alquilar. Herramientas para martilleros, corredores e inmobiliarias.";
export const DEFAULT_OG_IMAGE = "/crearcuentagratis.png";
export const TWITTER_HANDLE = "@georaapp";

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path: string = "/"): string {
  return new URL(path, SITE_URL).toString();
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
};

/** Builds a consistent Metadata object (title, description, canonical, OG, Twitter) for a page. */
export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  type = "website",
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "es_AR",
      type,
      images: [{ url: absoluteUrl(image) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

/** Organization JSON-LD, shared sitewide — helps AI/answer engines (GEO) identify who Geora is. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/Geora_Logo_Negro.svg"),
    description: DEFAULT_DESCRIPTION,
    areaServed: {
      "@type": "Country",
      name: "Argentina",
    },
    sameAs: [
      "https://www.instagram.com/geora.app",
      "https://x.com/georaapp",
      "https://www.facebook.com/geora.ar",
    ],
  };
}

/** WebSite JSON-LD with a search action, shared sitewide. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es-AR",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/** Renders a <script type="application/ld+json"> tag for any JSON-LD object. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
