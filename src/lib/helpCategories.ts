import { Building2, Users, Scale, FileSearch, LucideIcon } from "lucide-react";

export interface HelpCategory {
  name: string;
  slug: string;
  icon: LucideIcon;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { name: "Inmobiliarias", slug: "realestates", icon: Building2 },
  { name: "Compradores o Inquilinos", slug: "buyers", icon: Users },
  { name: "Legales", slug: "legal", icon: Scale },
  { name: "Valoraciones", slug: "valuations", icon: FileSearch },
];

export function getHelpCategoryBySlug(slug: string): HelpCategory | undefined {
  return HELP_CATEGORIES.find((cat) => cat.slug === slug);
}
