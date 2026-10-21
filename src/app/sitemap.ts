import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "hourly" },
  { path: "/map", priority: 0.9, changeFrequency: "hourly" },
  { path: "/properties", priority: 0.9, changeFrequency: "hourly" },
  { path: "/que-es-geora", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about-us", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/help", priority: 0.6, changeFrequency: "weekly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/conditions", priority: 0.2, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
];

// Sitemaps are capped at 50,000 URLs per the protocol; this keeps each dynamic
// section well under that while covering recently active listings/agencies first.
const MAX_DYNAMIC_ENTRIES = 20000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const [{ data: properties }, { data: realEstates }] = await Promise.all([
    admin
      .from("properties")
      .select("id, updated_at")
      .eq("status", "AVAILABLE")
      .order("updated_at", { ascending: false })
      .limit(MAX_DYNAMIC_ENTRIES),
    admin
      .from("real_estates")
      .select("profile_id, slug, profiles!inner(status)")
      .eq("profiles.status", "APPROVED")
      .limit(MAX_DYNAMIC_ENTRIES),
  ]);

  const propertyEntries: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${SITE_URL}/property/${p.id}`,
    lastModified: p.updated_at ?? undefined,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const realEstateEntries: MetadataRoute.Sitemap = (realEstates ?? []).map((r) => ({
    url: `${SITE_URL}/${r.slug || `realestate/${r.profile_id}`}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...propertyEntries, ...realEstateEntries];
}
