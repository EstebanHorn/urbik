import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHelpPostsByCategory, groupHelpPostsBySubcategory } from "@/lib/getHelpData";
import { getHelpCategoryBySlug } from "@/lib/helpCategories";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function HelpCategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getHelpCategoryBySlug(slug);

  if (!category) {
    return notFound();
  }

  const posts = getHelpPostsByCategory(category.name);
  const sections = groupHelpPostsBySubcategory(posts);
  const Icon = category.icon;

  return (
    <div className="bg-geora-white min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/help"
          className="inline-flex items-center gap-1 text-sm font-bold text-geora-dark2 hover:text-geora-black transition-colors mb-8"
        >
          <ChevronLeft size={16} /> Volver a Ayuda
        </Link>

        <div className="flex items-center gap-4 mb-12">
          <div className="bg-geora-black p-3 rounded-full text-white shrink-0">
            <Icon size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-geora-black tracking-tight">
            {category.name}
          </h1>
        </div>

        {sections.length === 0 ? (
          <p className="text-geora-dark2">
            Todavía no hay artículos en esta categoría. Muy pronto vamos a sumar contenido.
          </p>
        ) : (
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.subcategory}>
                <h2 className="text-lg font-bold text-geora-black mb-3 uppercase tracking-wide text-sm text-geora-emerald">
                  {section.subcategory}
                </h2>
                <div className="border border-gray-200 rounded-3xl overflow-hidden divide-y divide-gray-100 bg-white">
                  {section.posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/help/${post.slug}`}
                      className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-geora-white2 transition-colors group"
                    >
                      <span className="font-semibold text-geora-black">{post.title}</span>
                      <ChevronRight size={18} className="text-geora-dark2 shrink-0 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
